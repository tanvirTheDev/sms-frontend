import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useVerifyPhone, useResendOtp } from '@/features/auth/hooks'

export const Route = createFileRoute('/auth/verify-phone')({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: (search.phone as string) ?? '',
  }),
  component: VerifyPhonePage,
})

const schema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
})

type FormValues = z.infer<typeof schema>

function VerifyPhonePage() {
  const { phone } = Route.useSearch()
  const verify = useVerifyPhone()
  const resend = useResendOtp()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otp: '' },
  })

  const onSubmit = (values: FormValues) =>
    verify.mutate({ phone, otp: values.otp })

  const handleResend = () =>
    resend.mutate({ phone, purpose: 'PHONE_VERIFICATION' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify phone number</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP sent to <strong>{phone}</strong>
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-time password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      className="text-center text-xl tracking-[0.5em]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={verify.isPending}>
              {verify.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
            <div className="flex items-center justify-between w-full text-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resend.isPending}
              >
                {resend.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Resend OTP
              </Button>
              <Link to="/auth/login" className="text-muted-foreground hover:text-primary">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
