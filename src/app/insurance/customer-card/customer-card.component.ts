import {Component, Input} from '@angular/core';
import {Customer} from "../../customer/customer";

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})
export class CustomerCardComponent {

  @Input() customer: Customer;

}
