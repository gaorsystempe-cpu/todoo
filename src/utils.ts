import { OdooSaleOrder, OdooSaleOrderLine, CommissionRule, SalespersonSummary, ProductSoldDetail } from "./types";

export function calculateCommissionReport(
  orders: OdooSaleOrder[],
  orderLines: OdooSaleOrderLine[],
  rules: CommissionRule[]
): {
  summaries: SalespersonSummary[];
  totalCompanyRevenue: number;
  totalCompanyCommission: number;
} {
  const summariesMap: { [userId: number]: SalespersonSummary } = {};
  let totalCompanyRevenue = 0;
  let totalCompanyCommission = 0;

  // Make a fast rules lookup map
  const rulesMap: { [productId: number]: CommissionRule } = {};
  rules.forEach((rule) => {
    rulesMap[rule.productId] = rule;
  });

  // Make a fast order lookup map to get salesperson (user_id) for each line
  const ordersMap: { [orderId: number]: OdooSaleOrder } = {};
  orders.forEach((order) => {
    ordersMap[order.id] = order;
  });

  // Calculate commissions line by line
  orderLines.forEach((line) => {
    const orderIdVal = Array.isArray(line.order_id) ? line.order_id[0] : line.order_id;
    const parentOrder = ordersMap[orderIdVal];
    if (!parentOrder) return; // Skip lines whose parent orders aren't in active company scope

    const userIdTuple = parentOrder.user_id;
    if (!userIdTuple || !Array.isArray(userIdTuple)) return; // Skip if no salesperson assigned

    const [salespersonId, salespersonName] = userIdTuple;
    const productIdValue = Array.isArray(line.product_id) ? line.product_id[0] : line.product_id;
    const productName = Array.isArray(line.product_id) ? line.product_id[1] : `ID ${productIdValue}`;

    // Calculate commission for this product line
    const qty = line.product_uom_qty || 0;
    const subtotal = line.price_subtotal || (line.price_unit * qty) || 0;
    const rule = rulesMap[productIdValue];

    if (!rule) return; // SKIP products that do NOT have commission assigned!

    // Initialize Salesperson entry
    if (!summariesMap[salespersonId]) {
      summariesMap[salespersonId] = {
        id: salespersonId,
        name: salespersonName,
        totalSalesCount: 0,
        totalRevenue: 0,
        totalCommission: 0,
        soldProducts: {},
        commissionLines: []
      };
    }

    const salesperson = summariesMap[salespersonId];

    let lineCommission = 0;
    const ruleType = rule.type;
    const ruleValue = rule.value;
    
    if (rule.type === "percentage") {
      lineCommission = subtotal * (rule.value / 100);
    } else {
      lineCommission = qty * rule.value;
    }

    // Accumulate salesperson level stats
    salesperson.totalRevenue += subtotal;
    salesperson.totalCommission += lineCommission;
    totalCompanyRevenue += subtotal;
    totalCompanyCommission += lineCommission;

    // Append detailed commission line
    salesperson.commissionLines.push({
      orderId: orderIdVal,
      orderName: parentOrder.name,
      date: parentOrder.date_order,
      productId: productIdValue,
      productName: productName,
      qtySold: qty,
      revenue: subtotal,
      commission: lineCommission,
      ruleType,
      ruleValue
    });

    // Accumulate product line item under salesperson breakdown
    if (!salesperson.soldProducts[productIdValue]) {
      salesperson.soldProducts[productIdValue] = {
        id: productIdValue,
        name: productName,
        qtySold: 0,
        revenue: 0,
        commission: 0,
        ruleType,
        ruleValue
      };
    }

    const prodDetail = salesperson.soldProducts[productIdValue];
    prodDetail.qtySold += qty;
    prodDetail.revenue += subtotal;
    prodDetail.commission += lineCommission;
  });

  // Compute how many distinct orders each salesperson touched
  // Group orders by user_id
  const ordersCountMap: { [userId: number]: Set<number> } = {};
  orders.forEach((order) => {
    const userIdTuple = order.user_id;
    if (userIdTuple && Array.isArray(userIdTuple)) {
      const uId = userIdTuple[0];
      if (!ordersCountMap[uId]) {
        ordersCountMap[uId] = new Set();
      }
      ordersCountMap[uId].add(order.id);
    }
  });

  // Map counts back to final summaries array
  const summaries = Object.values(summariesMap).map((summary) => {
    summary.totalSalesCount = ordersCountMap[summary.id] ? ordersCountMap[summary.id].size : 0;
    return summary;
  });

  return {
    summaries,
    totalCompanyRevenue,
    totalCompanyCommission
  };
}
