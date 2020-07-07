import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';
import { ExecutionService } from 'src/app/execution/execution.service';
import {
  finishExecution,
  finishStepExecution,
  startExecution,
  startStepExecution,
} from '../ngrx/dataflow-execution.actions';

@Injectable()
export class ExecutionEffects {
  constructor(
    private actions$: Actions,
    private executionService: ExecutionService
  ) {}

  startExecution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startExecution),
      map((action) =>
        startStepExecution({
          scope: {
            steps: action.dataflow.steps,
            stepIndex: 0,
            variables: {},
          },
        })
      )
    )
  );

  stepExecution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startStepExecution),
      concatMap((action) => this.executionService.executeStep(action.scope))
    )
  );

  nextStepAfterFinishedPreviousStep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(finishStepExecution),
      map((action) =>
        action.scope.stepIndex + 1 === action.scope.steps.length
          ? finishExecution()
          : startStepExecution({
              scope: {
                ...action.scope,
                stepIndex: action.scope.stepIndex + 1,
              },
            })
      )
    )
  );
}
