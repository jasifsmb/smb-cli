import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Product extends Model {
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({ defaultValue: true })
  active: boolean;
}
