import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Dataflow } from '../types/dataflow.type';
import { Step } from '../types/step.type';
import { HttpRequestTemplate } from '../types/http-request-template.type';

@Injectable({
  providedIn: 'root',
})
export class DataflowFormService {
  constructor(private fb: FormBuilder) {}

  createDataFlow(dataflow: Dataflow): FormGroup {
    return this.fb.group({
      id: [dataflow.id],
      name: [dataflow.name],
      steps: this.createSteps(dataflow.steps),
    });
  }

  createSteps(steps: Step[]): FormArray {
    return this.fb.array(steps.map((step) => this.createStep(step)));
  }

  createStep(step: Step): FormGroup {
    return this.fb.group({
      assignTo: [step.assignTo],
      request: this.createHttpRequestTemplate(
        step.request
      ),
    });
  }

  createHttpRequestTemplate(
    request: HttpRequestTemplate
  ): FormGroup {
    return this.fb.group({
      method: [request.method],
      url: [request.url],
      body: [request.body],
      headers: [request.headers],
    });
  }
}
