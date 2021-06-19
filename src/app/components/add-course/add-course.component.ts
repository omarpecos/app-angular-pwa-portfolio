import { Component, DoCheck, OnInit } from '@angular/core';
import { Course } from '../../models/Course';
import { Tech } from '../../models/Tech';
import { Observable } from 'rxjs';
import { TechService } from '../../services/tech.service';
import { CourseService } from '../../services/course.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AnimationOptions } from 'ngx-lottie';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css'],
})
export class AddCourseComponent implements OnInit, DoCheck {
  private token;
  error: string = '';
  course: Course = new Course();

  Techs$: Observable<Tech[]> = null;
  techs: Array<Tech>;
  seeAddTechForm: boolean = false;
  selectedTechID: string = '-1';

  makeNew: boolean = false;
  options: AnimationOptions = {
    path: '/assets/lotties/courses.json',
  };

  constructor(
    private router: Router,
    private _techService: TechService,
    private _courseService: CourseService,
    private _authService: AuthService
  ) {
    this.token = this._authService.getToken();
    this.course.techs = [];
    this.course.done = true;
  }

  ngOnInit(): void {
    this.Techs$ = this._techService.getData(this.token);
    this.Techs$.subscribe((data) => (this.techs = data));
  }
  ngDoCheck() {
    this.token = this._authService.getToken();
  }

  addTech() {
    var techData = null;
    this.techs.map((tech) => {
      if (tech._id == this.selectedTechID) techData = tech;
    });

    var newTech = {
      _id: techData._id,
      ...techData,
    };

    this.course.techs.push(newTech);
  }

  deleteTech(id) {
    this.course.techs = this.course.techs.filter((item) => item._id != id);
  }

  saveCourse() {
    this.prepareCourseForSending();

    this._courseService.addItem(this.course, this.token).subscribe(
      (res) => {
        if (res.error) {
          this.error = res.error;
        } else {
          var host = 'API';
          if (res.local) host = 'LOCAL';

          //console.log("Course added - " + host, res.data.name);

          //redirect to home
          this.router.navigate(['/home']);
          //sw alert
          Swal.fire(
            'Good job! - ' + host,
            "Course ''" + res.data.name + "'' added in " + host,
            'success'
          );
        }
      },
      (error) => {
        //console.log(error);
        this.error = error.message;
      }
    );
  }

  prepareCourseForSending() {
    var newTechsArray = this.course.techs.map((tech) => {
      return tech._id;
    });
    this.course.techs = newTechsArray;
  }

  pasteJson() {
    navigator.clipboard
      .readText()
      .then((text) => {
        this.course = JSON.parse(text);
      })
      .catch((error) => {
        //console.log(error);
      });
  }

  setMakeNew() {
    this.course._id = null;
    this.makeNew = true;
  }
}
