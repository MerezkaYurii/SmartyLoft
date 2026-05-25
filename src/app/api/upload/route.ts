import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Указываем тип UploadApiResponse для возвращаемого промисом значения
    const data = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'smartyloft',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Теперь TypeScript точно знает, что у data есть свойство secure_url
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error('Ошибка при загрузке в Cloudinary:', error);
    return NextResponse.json({ error: 'Ошибка сервера при загрузке' }, { status: 500 });
  }
}