import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataFlowFormService } from 'src/app/services/data-flow-form.service';
import { HttpRequestStep } from 'src/app/types/step.type';
import { GlobalState } from 'src/app/ngrx/dataflow.state';
import { Store } from '@ngrx/store';
import { saveStep } from 'src/app/ngrx/dataflow.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-http-request-detail',
  templateUrl: './http-request-detail.component.html',
  styles: [],
})
export class HttpRequestDetailComponent implements OnChanges {
  @Input() stepIndex: number;
  @Input() step: HttpRequestStep;

  formGroup: FormGroup;

  constructor(
    private store: Store<GlobalState>,
    private router: Router,
    private dataflowFormService: DataFlowFormService
  ) {}

  ngOnChanges() {
    if (this.step?.httpRequestTemplate) {
      this.formGroup = this.dataflowFormService.createHttpRequestTemplate(
        this.step?.httpRequestTemplate
      );
    }
  }

  save() {
    this.store.dispatch(
      saveStep({
        stepIndex: this.stepIndex,
        step: { ...this.step, httpRequestTemplate: this.formGroup.value },
      })
    );
    this.router.navigate(['/']);
  }
}