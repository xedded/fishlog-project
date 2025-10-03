import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { DatabasePhotoInsert } from '@/types/database'

// Configure for larger payloads
export const runtime = 'nodejs' // Use Node.js runtime instead of Edge
export const maxDuration = 30 // Max 30 seconds

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

// Max file size: 5MB (but client-side compression should keep it under 500KB)
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
    const body = await request.json()
    const { photoId, filePath } = body

    if (!photoId || !filePath) {
      return NextResponse.json({ error: 'Missing photoId or filePath' }, { status: 400 })
    }

    // Delete from storage first
    const { error: storageError } = await supabaseAdmin
      .storage
      .from('catch-photos')
      .remove([filePath])

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
