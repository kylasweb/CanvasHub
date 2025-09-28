import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ProductTemplate, 
  ProductDesign, 
  ProductOrder, 
  DesignAnalytics,
  LayoutSettings,
  CustomizationOption,
  OrderItem
} from '../types/product-designer';

export class ProductDesignerService {
  // Template Management
  static async createTemplate(templateData: Omit<ProductTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ProductTemplate> {
    try {
      const templateRef = await addDoc(collection(db, 'product_templates'), {
        ...templateData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const templateDoc = await getDoc(templateRef);
      const data = templateDoc.data();
      return {
        id: templateDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate()
      } as ProductTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }
  }

  static async getTemplatesByTenant(tenantId: string): Promise<ProductTemplate[]> {
    try {
      const q = query(
        collection(db, 'product_templates'),
        where('tenant_id', '==', tenantId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate()
        } as ProductTemplate;
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      throw new Error('Failed to get templates');
    }
  }

  static async updateTemplate(templateId: string, updates: Partial<ProductTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, 'product_templates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  // Design Management
  static async createDesign(designData: Omit<ProductDesign, 'id' | 'created_at' | 'updated_at'>): Promise<ProductDesign> {
    try {
      const designRef = await addDoc(collection(db, 'product_designs'), {
        ...designData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const designDoc = await getDoc(designRef);
      const data = designDoc.data();
      return {
        id: designDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate()
      } as ProductDesign;
    } catch (error) {
      console.error('Error creating design:', error);
      throw new Error('Failed to create design');
    }
  }

  static async getDesignsByClient(clientId: string): Promise<ProductDesign[]> {
    try {
      const q = query(
        collection(db, 'product_designs'),
        where('client_id', '==', clientId),
        orderBy('updated_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate()
        } as ProductDesign;
      });
    } catch (error) {
      console.error('Error getting designs:', error);
      throw new Error('Failed to get designs');
    }
  }

  static async updateDesign(designId: string, updates: Partial<ProductDesign>): Promise<void> {
    try {
      const designRef = doc(db, 'product_designs', designId);
      await updateDoc(designRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating design:', error);
      throw new Error('Failed to update design');
    }
  }

  // Order Management
  static async createOrder(orderData: Omit<ProductOrder, 'id' | 'created_at' | 'updated_at'>): Promise<ProductOrder> {
    try {
      const orderRef = await addDoc(collection(db, 'product_orders'), {
        ...orderData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const orderDoc = await getDoc(orderRef);
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate(),
        order_date: data?.order_date?.toDate(),
        estimated_delivery: data?.estimated_delivery?.toDate()
      } as ProductOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  static async getOrdersByClient(clientId: string): Promise<ProductOrder[]> {
    try {
      const q = query(
        collection(db, 'product_orders'),
        where('client_id', '==', clientId),
        orderBy('order_date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate(),
          order_date: data?.order_date?.toDate(),
          estimated_delivery: data?.estimated_delivery?.toDate()
        } as ProductOrder;
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      throw new Error('Failed to get orders');
    }
  }

  static async updateOrderStatus(orderId: string, status: ProductOrder['status']): Promise<void> {
    try {
      const orderRef = doc(db, 'product_orders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Analytics
  static async getTemplateAnalytics(templateId: string): Promise<DesignAnalytics> {
    try {
      const designsQuery = query(
        collection(db, 'product_designs'),
        where('template_id', '==', templateId)
      );
      const designsSnapshot = await getDocs(designsQuery);
      const designs = designsSnapshot.docs.map(doc => doc.data());

      const ordersQuery = query(
        collection(db, 'product_orders'),
        where('template_id', '==', templateId)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data());

      const totalDesigns = designs.length;
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);

      return {
        template_id: templateId,
        total_designs: totalDesigns,
        total_orders: totalOrders,
        completed_orders: completedOrders,
        total_revenue: totalRevenue,
        conversion_rate: totalDesigns > 0 ? (totalOrders / totalDesigns) * 100 : 0,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        last_activity: new Date()
      };
    } catch (error) {
      console.error('Error getting template analytics:', error);
      throw new Error('Failed to get template analytics');
    }
  }

  // Layout Management
  static createDefaultLayout(photoCount: number): LayoutSettings {
    const layouts = {
      1: { rows: 1, cols: 1, spacing: 0, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      2: { rows: 1, cols: 2, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      3: { rows: 1, cols: 3, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      4: { rows: 2, cols: 2, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      6: { rows: 2, cols: 3, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      8: { rows: 2, cols: 4, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      9: { rows: 3, cols: 3, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } },
      12: { rows: 3, cols: 4, spacing: 10, margins: { top: 0, right: 0, bottom: 0, left: 0 } }
    };

    // Find the closest layout for the given photo count
    const availableLayouts = Object.keys(layouts).map(Number).sort((a, b) => a - b);
    const selectedCount = availableLayouts.find(count => count >= photoCount) || availableLayouts[availableLayouts.length - 1];
    
    return layouts[selectedCount as keyof typeof layouts] || layouts[12];
  }

  static async saveLayout(designId: string, layout: LayoutSettings): Promise<void> {
    try {
      const designRef = doc(db, 'product_designs', designId);
      await updateDoc(designRef, {
        layout: layout,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving layout:', error);
      throw new Error('Failed to save layout');
    }
  }

  // Customization Management
  static async addCustomization(designId: string, customization: CustomizationOption): Promise<void> {
    try {
      const designRef = doc(db, 'product_designs', designId);
      const designDoc = await getDoc(designRef);
      const design = designDoc.data();

      if (!design) {
        throw new Error('Design not found');
      }

      const updatedCustomizations = [...(design.customizations || []), customization];
      await updateDoc(designRef, {
        customizations: updatedCustomizations,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding customization:', error);
      throw new Error('Failed to add customization');
    }
  }

  static async removeCustomization(designId: string, customizationId: string): Promise<void> {
    try {
      const designRef = doc(db, 'product_designs', designId);
      const designDoc = await getDoc(designRef);
      const design = designDoc.data();

      if (!design) {
        throw new Error('Design not found');
      }

      const updatedCustomizations = (design.customizations || []).filter(c => c.id !== customizationId);
      await updateDoc(designRef, {
        customizations: updatedCustomizations,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing customization:', error);
      throw new Error('Failed to remove customization');
    }
  }

  // Order Item Management
  static async addOrderItem(orderId: string, item: OrderItem): Promise<void> {
    try {
      const orderRef = doc(db, 'product_orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const order = orderDoc.data();

      if (!order) {
        throw new Error('Order not found');
      }

      const updatedItems = [...(order.items || []), item];
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price, 0);

      await updateDoc(orderRef, {
        items: updatedItems,
        total_price: newTotalPrice,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding order item:', error);
      throw new Error('Failed to add order item');
    }
  }

  static async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    try {
      const orderRef = doc(db, 'product_orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const order = orderDoc.data();

      if (!order) {
        throw new Error('Order not found');
      }

      const updatedItems = (order.items || []).filter(item => item.id !== itemId);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price, 0);

      await updateDoc(orderRef, {
        items: updatedItems,
        total_price: newTotalPrice,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing order item:', error);
      throw new Error('Failed to remove order item');
    }
  }

  // Default Settings
  static createDefaultTemplateSettings() {
    return {
      allow_custom_layout: true,
      min_photos: 1,
      max_photos: 50,
      default_spacing: 10,
      default_margins: { top: 0, right: 0, bottom: 0, left: 0 },
      available_customizations: [
        { id: 'cover', name: 'Cover Design', type: 'cover', options: [] },
        { id: 'paper', name: 'Paper Type', type: 'paper', options: [] },
        { id: 'finish', name: 'Finish', type: 'finish', options: [] },
        { id: 'binding', name: 'Binding', type: 'binding', options: [] }
      ]
    };
  }
}