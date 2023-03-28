import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import { Country, CountrySchema } from '../country/entities/country.entity';
import { StateController } from './state.controller';
import { StateService } from './state.service';

@Module({
  imports: [
    MongoModule.registerAsync({
      name: Country.name,
      imports: [],
      useFactory: () => {
        const schema = CountrySchema;
        schema.virtual('country', {
          ref: 'Country',
          localField: '_id',
          foreignField: 'country_id',
          justOne: true,
          match: { deleted_at: null },
        });
        return schema;
      },
      inject: [],
    }),
  ],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
