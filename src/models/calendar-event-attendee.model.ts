import { Model, Table, Column } from '@gao/orm';

export type AttendeeType = 'user' | 'contact' | 'external';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

@Table('calendar_event_attendees')
export class CalendarEventAttendee extends Model {
    @Column() declare id: string;
    @Column() event_id!: string;
    @Column() attendee_type!: AttendeeType;
    @Column() user_id?: string;
    @Column() contact_id?: string;
    @Column() email?: string;
    @Column() name?: string;
    @Column() rsvp_status!: RsvpStatus;
    @Column() declare created_at: string;
}
