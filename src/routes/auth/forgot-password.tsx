import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForgotPassword } from '@/features/auth/hooks'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
})

const schema = z.object({
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
})

type FormValues = z.infer<typeof schema>

function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  })

  const onSubmit = (values: FormValues) => forgotPassword.mutate(values)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your registered phone number. We&apos;ll send an OTP to reset your password.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary text-center"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
