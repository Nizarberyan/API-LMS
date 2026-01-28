import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadsController {
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    return res.sendFile(filePath);
  }
}
