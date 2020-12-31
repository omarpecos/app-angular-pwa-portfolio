import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Profile } from '../../models/Profile';
import { Observable } from 'rxjs';
import { Tech } from '../../models/Tech';
import { TechService } from '../../services/tech.service';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { setColor } from './../../utils/helpers';

@Component({
  selector: 'app-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.css']
})
export class AddProfileComponent implements OnInit {

  profile : Profile = new Profile();
  error : string = '';

  Techs$ : Observable<Tech[]> = null;
  techs : Tech[];

  selectedSkillID : string = '-1';
  selectedPercentage : number = 0;
  seeAddSkillForm : boolean = false;

  constructor(
    private location : Location,
    private router : Router,
    private _techService : TechService,
    private _profileService : ProfileService
  ) {

    this.profile.intro = '';
    this.profile.about = {
      text : '',
      skills : []
    }
    this.profile.version = 0;
    
    let data : any = this.location.getState();
    
    if (data.about){
      this.profile = data as Profile;
    }
   }

  ngOnInit(): void {
    this.Techs$ = this._techService.getData();
    this.Techs$.subscribe(
      data => this.techs = data
    )
  }

  setColor = setColor;

  addSkill(){
    var techData = null;
    this.techs.map(tech => {
      if (tech._id == this.selectedSkillID)
        techData = tech;
    })
    var skill = {
      _id : techData._id,
      tech : techData,
      percentage : this.selectedPercentage
    }

    this.profile.about.skills.push( skill );
  }

  deleteSkill(id){
    this.profile.about.skills = this.profile.about.skills.filter(item => item._id != id);
  }

  
  saveProfile(){
    this.prepareToPostProfileData();

    this._profileService.addItem( this.profile )
    .subscribe(
      res =>{
        if (res.error){
          this.error = res.error;
        }else{
          var host = 'API';
          if (res.local)
            host = 'LOCAL';
            
          //console.log("Profile added - " + host);

          //redirect to home
          this.router.navigate(['/home']);
          //sw alert
          Swal.fire("Good job! - " + host, "Profile version ''"+ res.data.version +"'' added in "+ host, "success");
        }
        
      },
      error =>{
        //console.log(error);
        this.error = error.message;
      }
    )
  }

  prepareToPostProfileData(){
    this.profile.about.skills.map(skill =>{
      skill.tech = skill._id;
    })
    this.profile.version ++;
  }
}