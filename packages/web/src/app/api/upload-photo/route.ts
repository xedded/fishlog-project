import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { DatabasePhotoInsert } from '@/types/database'

// Create Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const catchId = formData.get('catchId') as string
    const userId = formData.get('userId') as string

    if (!file || !catchId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, catchId, userId' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Count existing photos for this catch to determine index
    const { data: existingPhotos } = await supabaseAdmin
      .from('photos')
      .select('id')
      .eq('catch_id', catchId)

    const photoIndex = (existingPhotos?.length || 0) + 1

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'

    // Create file path: {user_id}/{catch_id}_{index}.{ext}
    const filePath = `${userId}/${catchId}_${photoIndex}.${fileExt}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('catch-photos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    // Insert photo record in database
    const photoInsert: DatabasePhotoInsert = {
      catch_id: catchId,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    }

    const { data: photoData, error: dbError } = await supabaseAdmin
      .from('photos')
      .insert(photoInsert)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)

      // Rollback: delete uploaded file
      await supabaseAdmin.storage.from('catch-photos').remove([filePath])

      return NextResponse.json(
        { error: 'Failed to save photo metadata', details: dbError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('catch-photos')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      photo: {
        ...photoData,
        publicUrl
      }
    })

  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove photos
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })
    }

    // Get photo metadata to find file path
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('photos')
      .select('file_path')
      .eq('id', photoId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin
      .storage
      .from('catch-photos')
      .remove([photo.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete photo from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
