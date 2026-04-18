import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
// Ensure only authorized staff or admins can download reports
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('sales')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Full sales report (Admin/Staff)' })
  async salesReport(@Query() query: { limit?: string; offset?: string }) {
    return this.reportsService.getSaleReport(query);
  }

  @Get('sales/export')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Export full sales report as XLSX (Admin/Staff)' })
  async exportSalesReport(@Res() res: Response) {
    const buffer = await this.reportsService.generateSalesReport();

    // Set the necessary headers so the browser knows to download a file
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sales_report_${new Date().getTime()}.xlsx"`,
      'Content-Length': buffer.length,
    });

    // Send the buffer to the client
    res.end(buffer);
  }
}
