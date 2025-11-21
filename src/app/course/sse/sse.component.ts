import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FoodOrder} from "../food-order";
import {SseService} from "./sse.service";
import {of, SubscriptionLike} from "rxjs";
import {MessageData} from "./message-data";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-sse',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './sse.component.html',
  styleUrl: './sse.component.scss'
})
export class SseComponent implements OnInit, OnDestroy {
  private eventSourceSubscription: SubscriptionLike;

  private sseService = inject(SseService);
  messagesVerdammt: MessageData[] = [];

  ngOnInit(): void {
    // this.messagesVerdammt.push({status: "OPEN", message: "hallo"});
    // this.messagesVerdammt.push({status: "CLOSED", message: "closed"});
    // const foodOrder: FoodOrder = {
    //   id: 1,
    //   status: "ORDER_PLACED"
    // }
    // const url: string = 'http://localhost:1111/order-status';
    // const options = {withCredentials: true};
    // const eventNames = ['myEventName'];
    // this.eventSourceSubscription = this.sseService.createEventSource(url).subscribe({
    //     next: data => {
    //       console.log('data');
    //       console.log(data);
    //       // console.log(data.message);
    //       const newMessageData: MessageData = {
    //         status: null,
    //         message: null,
    //       }
    //       this.messagesVerdammt.push(newMessageData);
    //       console.log(this.messagesVerdammt);
    //       //handle event
    //     },
    //     error: error => {
    //       //handle error
    //     }
    //   }
    // );

    // this.sseService.createEventSource(foodOrder).subscribe({
    //   next: (e => {
    //     console.log("e");
    //     console.log(e.status, e.message);
    //   })
    // })

  }

  subscribeToEventSource() {

  }

  ngOnDestroy() {
    this.eventSourceSubscription.unsubscribe();
    this.sseService.close();
  }

  protected readonly of = of;
}
