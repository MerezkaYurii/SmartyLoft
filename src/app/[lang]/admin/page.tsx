import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Если пользователь авторизован (проверка пройдет через middleware),
  // то при заходе на /admin его плавно перенаправит на список товаров.
  redirect('/admin/products');
}
