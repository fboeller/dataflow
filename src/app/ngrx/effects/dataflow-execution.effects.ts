import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { DataFlowExecutionService } from 'src/app/services/data-flow-execution.service';

import { finishExecution, finishStepExecution, startExecution, startStepExecution } from '../dataflow.actions';

@Injectable()
export class DataFlowExecutionEffects {
  constructor(
    private actions$: Actions,
    private dataflowExecutionService: DataFlowExecutionService
  ) {}

  startExecution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startExecution),
      map((action) =>
        startStepExecution({ steps: action.steps, stepIndex: 0, variables: {} })
      )
    )
  );

  stepExecution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startStepExecution),
      concatMap((action) =>
        this.dataflowExecutionService
          .request(
            this.dataflowExecutionService.createHttpRequest(
              action.steps[action.stepIndex].request,
              action.variables
            )
          )
          .pipe(
            catchError((response) => of(response)),
            map((httpResponse) =>
              finishStepExecution({
                stepIndex: action.stepIndex,
                evaluation: httpResponse,
                steps: action.steps,
                variables: {
                  ...action.variables,
                  [action.steps[action.stepIndex].assignTo]: httpResponse,
                },
              })
            )
          )
      )
    )
  );

  nextStepAfterFinishedPreviousStep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(finishStepExecution),
      map((action) =>
        action.stepIndex + 1 === action.steps.length
          ? finishExecution()
          : startStepExecution({
              steps: action.steps,
              stepIndex: action.stepIndex + 1,
              variables: action.variables,
            })
      )
    )
  );
}
