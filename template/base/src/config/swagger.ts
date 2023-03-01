import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const SwaggerConfig = new DocumentBuilder()
  .setTitle('NewAgeSmb Core Framework')
  .setDescription('Newagesmb core framework API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const SwaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
