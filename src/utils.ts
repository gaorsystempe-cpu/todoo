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

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeOrderLines = Array.isArray(orderLines) ? orderLines : [];
  const safeRules = Array.isArray(rules) ? rules : [];

  // Make a fast rules lookup map
  const rulesMap: { [productId: number]: CommissionRule } = {};
  safeRules.forEach((rule) => {
    if (rule && typeof rule.productId === "number") {
      rulesMap[rule.productId] = rule;
    }
  });

  // Make a fast order lookup map to get salesperson (user_id) for each line
  const ordersMap: { [orderId: number]: OdooSaleOrder } = {};
  safeOrders.forEach((order) => {
    if (order && order.id) {
      ordersMap[order.id] = order;
    }
  });

  // Calculate commissions line by line
  safeOrderLines.forEach((line) => {
    if (!line) return;
    
    const orderIdVal = Array.isArray(line.order_id) ? line.order_id[0] : line.order_id;
    if (orderIdVal === undefined || orderIdVal === null || (orderIdVal as any) === false) return;
    
    const parentOrder = ordersMap[orderIdVal as number];
    if (!parentOrder) return; // Skip lines whose parent orders aren't in active company scope

    const userIdTuple = parentOrder.user_id;
    if (!userIdTuple || !Array.isArray(userIdTuple) || userIdTuple.length < 2) return; // Skip if no salesperson assigned

    const salespersonId = userIdTuple[0];
    const salespersonName = userIdTuple[1] || `Vendedor ${salespersonId}`;
    if (typeof salespersonId !== "number") return;

    const productIdValue = Array.isArray(line.product_id) ? line.product_id[0] : line.product_id;
    if (productIdValue === undefined || productIdValue === null || (productIdValue as any) === false) return;
    
    const productName = Array.isArray(line.product_id) ? line.product_id[1] : `ID ${productIdValue}`;
    const safeProductName = typeof productName === "string" ? productName : `ID ${productIdValue}`;

    // Calculate commission for this product line
    const qty = typeof line.product_uom_qty === "number" ? line.product_uom_qty : parseFloat(line.product_uom_qty as any) || 0;
    const priceUnit = typeof line.price_unit === "number" ? line.price_unit : parseFloat(line.price_unit as any) || 0;
    const subtotal = typeof line.price_subtotal === "number" ? line.price_subtotal : parseFloat(line.price_subtotal as any) || (priceUnit * qty) || 0;
    const rule = rulesMap[productIdValue as number];

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
    const ruleType = rule.type || "percentage";
    const ruleValue = typeof rule.value === "number" ? rule.value : parseFloat(rule.value as any) || 0;
    
    if (ruleType === "percentage") {
      lineCommission = subtotal * (ruleValue / 100);
    } else {
      lineCommission = qty * ruleValue;
    }

    // Accumulate salesperson level stats
    salesperson.totalRevenue += subtotal;
    salesperson.totalCommission += lineCommission;
    totalCompanyRevenue += subtotal;
    totalCompanyCommission += lineCommission;

    const parentOrderDate = parentOrder.date_order || "";
    const parentOrderName = parentOrder.name || `Pedido #${parentOrder.id}`;

    // Append detailed commission line
    salesperson.commissionLines.push({
      orderId: orderIdVal as number,
      orderName: parentOrderName,
      date: parentOrderDate,
      productId: productIdValue as number,
      productName: safeProductName,
      qtySold: qty,
      revenue: subtotal,
      commission: lineCommission,
      ruleType,
      ruleValue
    });

    // Accumulate product line item under salesperson breakdown
    const pidNum = productIdValue as number;
    if (!salesperson.soldProducts[pidNum]) {
      salesperson.soldProducts[pidNum] = {
        id: pidNum,
        name: safeProductName,
        qtySold: 0,
        revenue: 0,
        commission: 0,
        ruleType,
        ruleValue
      };
    }

    const prodDetail = salesperson.soldProducts[pidNum];
    prodDetail.qtySold += qty;
    prodDetail.revenue += subtotal;
    prodDetail.commission += lineCommission;
  });

  // Compute how many distinct orders each salesperson touched
  // Group orders by user_id
  const ordersCountMap: { [userId: number]: Set<number> } = {};
  safeOrders.forEach((order) => {
    if (!order) return;
    const userIdTuple = order.user_id;
    if (userIdTuple && Array.isArray(userIdTuple) && userIdTuple.length >= 1) {
      const uId = userIdTuple[0];
      if (typeof uId === "number") {
        if (!ordersCountMap[uId]) {
          ordersCountMap[uId] = new Set();
        }
        ordersCountMap[uId].add(order.id);
      }
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
