import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concat, from, Observable, of } from 'rxjs';
import { concatMap, delay, map } from "rxjs/operators";
import { MESSAGES } from './shared/messages';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {

  messages$: Observable<string>;
  pauseDelay: number = 5000;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe((query) => {
      if (query.has('pause')) {
        this.pauseDelay = (+query.get('pause') * 1000);
      }
      this.typeWithRxjs();
    });

  }

  typeWithRxjs(): void {
    const TYPING_DELAY = 40;

    let currentMessage = '';

    const events$: Observable<string>[] = [];

    // Event Observable 1
    const typeEachCharacter$ = (msg: string) => from(msg).pipe(
      concatMap((char) => {
        currentMessage += char;
        return of(currentMessage).pipe(
          delay(TYPING_DELAY),
        );
      })
    );

    // Event Observable 2
    const pause = of(null).pipe(
      delay(this.pauseDelay)
    );

    // Event Observable 3
    const restart = of(null).pipe(
      map(() => {
        currentMessage = '';
        return '';
      })
    );

    MESSAGES.forEach((msg, index) => {
      events$.push(typeEachCharacter$(msg));
      // do not delete the last line
      if (index < MESSAGES.length - 1) {
        events$.push(pause);
        events$.push(restart);
      }
    });

    this.messages$ = concat(...events$);
  }
}
