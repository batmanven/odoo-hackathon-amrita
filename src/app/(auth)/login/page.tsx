'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { loginAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state?.error])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">

        <div
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 cursor-pointer relative overflow-hidden group border-2 border-dashed border-primary/50 hover:border-primary transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
          ) : (
            <UserCircle className="w-12 h-12 text-primary" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>

        <form action={formAction} className="w-full space-y-5">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <input type="hidden" name="avatarBase64" value={avatarPreview || ''} />
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
              {state.error}
            </div>
          )}

          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              required
            />
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline cursor-pointer">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="
      w-full py-5 text-md font-medium
      cursor-pointer
      transition-all duration-200
      hover:bg-primary/90
      hover:scale-[1.01]
      active:scale-[0.98]
      disabled:cursor-not-allowed
    "
            >
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Don&apos;t have an account? <Link href="/register" className="text-primary font-semibold hover:underline cursor-pointer">Register here</Link>
        </div>
      </div>
    </div>
  )
}
