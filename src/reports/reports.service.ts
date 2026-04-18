import { Inject, Injectable, Logger } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as ExcelJS from 'exceljs';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  async getSaleReport(req: { limit?: string; offset?: string }) {
    this.logger.log('Fetching data for sales report...');
    const { limit, offset } = req || { limit: 10, offset: 0 };

    // 1. Fetch data using Drizzle ORM Joins
    // Note: Adjust the schema references below if your table variables differ slightly
    return (
      this.db
        .select({
          productName: schema.products.name,
          price: schema.products.price,
          categoryName: schema.categories.name,
          qty: schema.orderItems.qty,
          orderId: schema.orders.id,
          orderStatus: schema.orders.status,
          amount: schema.payments.amount, // Or calculate: qty * unitPrice
          paymentId: schema.payments.id,
          paymentStatus: schema.payments.status,
        })
        // Start from orderItems since the report focuses on line-item details
        .from(schema.orderItems)
        .limit(Number(limit))
        .offset(Number(offset))
        .leftJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
        .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
        .leftJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
        .leftJoin(schema.payments, eq(schema.orders.id, schema.payments.orderId))
    );
  }

  async generateSalesReport(): Promise<Buffer> {
    const reportData = await this.getSaleReport({});
    this.logger.log(`Found ${reportData.length} records. Generating Excel file...`);

    // 2. Initialize Excel Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'My NestJS App';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Sales Data');

    // 3. Define Columns
    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 12 },
      { header: 'Order Status', key: 'orderStatus', width: 15 },
      { header: 'Payment ID', key: 'paymentId', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'Category', key: 'categoryName', width: 20 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Qty', key: 'qty', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Total Price', key: 'totalPrice', width: 15 },
    ];

    // Style the header row (Bold, Light Gray Background)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 4. Populate Rows
    reportData.forEach((row) => {
      worksheet.addRow({
        orderId: row.orderId,
        orderStatus: row.orderStatus || 'N/A',
        paymentId: row.paymentId || 'N/A',
        paymentStatus: row.paymentStatus || 'UNPAID',
        categoryName: row.categoryName || 'Uncategorized',
        productName: row.productName || 'Unknown Product',
        qty: row.qty,
        // Format as numbers for proper Excel formatting
        unitPrice: Number(row.price),
        totalPrice: Number(row.amount),
      });
    });

    // Optional: Format currency columns
    worksheet.getColumn('unitPrice').numFmt = '"$"#,##0.00';
    worksheet.getColumn('totalPrice').numFmt = '"$"#,##0.00';

    // 5. Write to buffer and return
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer as unknown as Buffer;
  }
}
