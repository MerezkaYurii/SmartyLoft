import Category from '@/src/DataBase/models/Category';
import { initMongoConnection } from '@/src/lib/mongoose';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await initMongoConnection();
    const { id } = await params;
    const body = await request.json();
    const { title, imageUrl } = body;

    if (!title || typeof title !== 'object') {
      return NextResponse.json(
        { error: 'Title object is required' },
        { status: 400 },
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { title, imageUrl: imageUrl || '' },
      { new: true }, // Возвращает уже обновленный документ
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating category:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await initMongoConnection();
    const { id } = await params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting category:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 },
    );
  }
}
