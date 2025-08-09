# Email Verification Troubleshooting Guide

## Issue: Not Receiving Verification Emails After Signup

### Common Causes & Solutions:

## 1. **Supabase Email Configuration Issues**

### Check Email Settings in Supabase Dashboard:
1. Go to **Authentication → Settings**
2. Verify **Enable email confirmations** is turned ON
3. Check **Email confirmation** settings

### Email Template Configuration:
1. Go to **Authentication → Email Templates**
2. Click on **Confirm signup** template
3. Ensure the redirect URL is: `https://rhafrica.netlify.app/auth/callback`

## 2. **SMTP Configuration (Most Common Issue)**

By default, Supabase uses their built-in email service which has limitations:
- Limited daily quota
- May be blocked by some email providers
- Not reliable for production

### Solution: Configure Custom SMTP

1. Go to **Settings → Authentication**
2. Scroll to **SMTP Settings**
3. Enable **Enable custom SMTP**
4. Configure with a reliable email service:

#### Recommended SMTP Providers:

**Gmail SMTP:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not regular password)
Sender Name: Real Estate Hotspot
Sender Email: your-email@gmail.com
```

**SendGrid SMTP:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
Sender Name: Real Estate Hotspot
Sender Email: noreply@rhafrica.com
```

**Mailgun SMTP:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-username
SMTP Pass: your-mailgun-password
Sender Name: Real Estate Hotspot
Sender Email: noreply@rhafrica.com
```

## 3. **Domain Authentication Issues**

### Add SPF Record to your domain:
```
TXT record: v=spf1 include:_spf.supabase.co ~all
```

### Add DKIM Record (if using custom domain):
Get DKIM keys from your email provider and add to DNS.

## 4. **Rate Limiting Issues**

Supabase has rate limits on emails:
- Check if you've exceeded the daily limit
- Wait and try again
- Consider upgrading your Supabase plan

## 5. **Email Provider Blocking**

Some email providers (especially corporate ones) block automated emails:
- Check spam/junk folders
- Try with Gmail, Yahoo, or Outlook
- Whitelist your domain

## 6. **Code-Level Fixes**

### Update Signup Function with Better Error Handling:

```typescript
const signup = async (userData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          accountType: accountType,
        },
        emailRedirectTo: `https://rhafrica.netlify.app/auth/callback?type=signup`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }

    // Check if user was created but needs confirmation
    if (data.user && !data.session) {
      console.log('User created, confirmation email should be sent');
      return { success: true };
    }

    // If user was created and confirmed immediately
    if (data.user && data.session) {
      console.log('User created and confirmed immediately');
      return { success: true };
    }

    return { success: false, error: 'Signup failed' };
  } catch (error) {
    console.error("Signup failed:", error);
    return { success: false, error: 'An unexpected error occurred' };
  } finally {
    setIsLoading(false);
  }
};
```

## 7. **Testing Steps**

### Immediate Tests:
1. Check Supabase logs: **Authentication → Logs**
2. Try signup with different email providers
3. Check spam/junk folders
4. Test with a simple email like Gmail

### Debug Mode:
Add this to your signup function to see what's happening:

```typescript
console.log('Signup attempt:', {
  email: userData.email,
  redirectTo: `https://rhafrica.netlify.app/auth/callback?type=signup`
});

const { data, error } = await supabase.auth.signUp({
  // ... your signup code
});

console.log('Signup result:', { data, error });
```

## 8. **Alternative Solutions**

### Temporary Workaround - Disable Email Confirmation:
1. Go to **Authentication → Settings**
2. Turn OFF **Enable email confirmations**
3. Users will be signed in immediately (less secure)

### Manual Email Verification:
Create a custom email verification system using a third-party service.

## 9. **Production Checklist**

- [ ] Custom SMTP configured
- [ ] Email templates updated with correct URLs
- [ ] DNS records configured (SPF, DKIM)
- [ ] Rate limits checked
- [ ] Test emails sent successfully
- [ ] Spam folder checked
- [ ] Multiple email providers tested

## 10. **Quick Fix for Testing**

If you need to test immediately:

1. **Disable email confirmation temporarily**
2. **Use a reliable email service like Gmail**
3. **Check Supabase authentication logs**
4. **Verify your environment variables are correct**

## Next Steps:

1. Configure custom SMTP (recommended)
2. Test with Gmail account
3. Check Supabase logs for errors
4. Verify URL configuration
5. Test the complete flow

The most common fix is setting up custom SMTP. Supabase's default email service is not reliable for production use.