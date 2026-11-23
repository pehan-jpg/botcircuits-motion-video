import {CalendarIcon, CardIcon, TicketIcon, UsersIcon} from '../../components/Icons';

export const AGENT_NAME = 'Booking support';
export const counterText = (n: number) => `${n} of 4 systems connected`;

export const SYSTEMS = [
  {icon: UsersIcon, name: 'CRM', detail: 'Customer records'},
  {icon: CalendarIcon, name: 'Booking', detail: 'Reservations'},
  {icon: CardIcon, name: 'Payments', detail: 'Charges and refunds'},
  {icon: TicketIcon, name: 'Ticketing', detail: 'Requests and cases'},
] as const;

/** Actions the agent takes once connected: tool name, target tile and result. */
export const ACTIONS = [
  {fn: 'update_booking', tile: 1, result: 'Departure moved to 15 Dec'},
  {fn: 'collect_payment', tile: 2, result: 'Change fee collected'},
] as const;
