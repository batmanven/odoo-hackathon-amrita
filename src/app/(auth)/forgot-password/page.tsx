'use client'

import { useActionState, useEffect } from 'react'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
    }
  }, [state])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">

        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <UserCircle className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-xl font-bold mb-2 text-center text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form action={formAction} className="w-full space-y-5">
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
              {state.success}
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
              {isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Remember your password? <Link href="/login" className="text-primary font-semibold hover:underline cursor-pointer">Login here</Link>
        </div>
      </div>
    </div>
  )
}
