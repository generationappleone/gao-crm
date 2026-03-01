import { Model, Table, Column } from '@gao/orm';
@Table('channel_members') export class ChannelMember extends Model { @Column() declare id: string; @Column() channel_id!: string; @Column() user_id!: string; @Column() role!: string; @Column() last_read_at?: string; @Column() joined_at!: string; }
