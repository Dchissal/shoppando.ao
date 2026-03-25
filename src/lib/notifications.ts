import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationType } from '../types';

// Helper function to create a notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: {
    orderId?: string;
    productId?: string;
    orderStatus?: string;
    link?: string;
  }
) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      data: data || {},
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Get status text in Portuguese
export function getOrderStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'processing': return 'Em Processamento';
    case 'shipped': return 'Enviado';
    case 'delivered': return 'Entregue';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
}

// Create notification when order status changes
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  newStatus: string,
  orderNumber?: string
) {
  const statusText = getOrderStatusText(newStatus);
  const orderRef = orderNumber || orderId.slice(-6).toUpperCase();

  let title = '';
  let message = '';

  switch (newStatus) {
    case 'processing':
      title = 'Pedido em Processamento';
      message = `O seu pedido #${orderRef} está a ser preparado.`;
      break;
    case 'shipped':
      title = 'Pedido Enviado!';
      message = `O seu pedido #${orderRef} foi enviado e está a caminho.`;
      break;
    case 'delivered':
      title = 'Pedido Entregue!';
      message = `O seu pedido #${orderRef} foi entregue com sucesso.`;
      break;
    case 'cancelled':
      title = 'Pedido Cancelado';
      message = `O seu pedido #${orderRef} foi cancelado.`;
      break;
    default:
      title = 'Atualização do Pedido';
      message = `O estado do seu pedido #${orderRef} foi atualizado para: ${statusText}`;
  }

  await createNotification(userId, 'order_status', title, message, {
    orderId,
    orderStatus: newStatus,
    link: '/account'
  });
}

// Notify all admins about a new order
export async function notifyAdminsNewOrder(
  orderId: string,
  customerName: string,
  total: number
) {
  try {
    // Get all admin users
    const adminsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'admin')
    );
    const adminsSnapshot = await getDocs(adminsQuery);

    const orderRef = orderId.slice(-6).toUpperCase();

    // Create notification for each admin
    const notifications = adminsSnapshot.docs.map(adminDoc => {
      return createNotification(
        adminDoc.id,
        'new_order',
        'Novo Pedido Recebido!',
        `${customerName} fez um pedido de ${total.toLocaleString()} Kz (#${orderRef})`,
        {
          orderId,
          link: '/admin'
        }
      );
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

// Notify user about a new product (for promo/marketing)
export async function notifyNewProduct(
  userId: string,
  productId: string,
  productName: string,
  category: string
) {
  await createNotification(
    userId,
    'new_product',
    'Novo Produto Disponível!',
    `${productName} acabou de chegar na categoria ${category}.`,
    {
      productId,
      link: `/product/${productId}`
    }
  );
}

// Notify user about a promotion
export async function notifyPromotion(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  await createNotification(userId, 'promo', title, message, { link });
}
