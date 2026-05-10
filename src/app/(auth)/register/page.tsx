'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { signupAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UserCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">

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
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100 text-center">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="text"
              name="city"
              placeholder="City"
              required
            />
            <Input
              type="text"
              name="country"
              placeholder="Country"
              required
            />
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              minLength={6}
            />
          </div>

          <Textarea
            name="additionalInfo"
            placeholder="Additional Information"
            className="min-h-[120px] resize-none"
          />

          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              disabled={isPending}
              className="
      w-full md:w-auto px-12 py-6 text-md font-medium
      cursor-pointer
      transition-all duration-200
      hover:bg-primary/90
      hover:scale-[1.02]
      active:scale-[0.98]
      disabled:cursor-not-allowed
    "
            >
              {isPending ? 'Creating Account...' : 'Register User'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline cursor-pointer">Login here</Link>
        </div>

      </div>
    </div>
  )
}
