# Security Policy

## 🔒 Overview

The security of the Habit Tracker application and user data is a top priority. This document outlines our security policies, supported versions, and procedures for reporting vulnerabilities.

## 📋 Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.x.x   | :white_check_mark: | Current stable release |
| < 1.0   | :x:                | Legacy - no longer supported |

**Note**: As this is a web application, we recommend always using the latest version deployed from the `main` branch.

## 🐛 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### Reporting Process

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. **Email** security reports to: `muthyala_sharath.reddy@uconn.edu`
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Suggested fix (if available)
   - Your contact information

### What to Expect

- **Initial Response**: Within 48 hours of your report
- **Status Updates**: Every 5-7 days until the issue is resolved
- **Resolution Timeline**: Critical issues within 7 days, others within 30 days
- **Credit**: Security researchers will be credited (if desired) in the fix announcement

### Vulnerability Acceptance Criteria

A vulnerability will be accepted if it:
- Compromises user data confidentiality, integrity, or availability
- Allows unauthorized access to user accounts or data
- Enables execution of malicious code
- Bypasses authentication or authorization mechanisms
- Exposes sensitive configuration or credentials

## 🛡️ Security Best Practices

### For Users

#### Account Security
- ✅ Use strong, unique passwords (minimum 8 characters)
- ✅ Never share your account credentials
- ✅ Log out when using shared devices
- ✅ Enable two-factor authentication (when available)

#### Data Protection
- ✅ Access the app only over HTTPS in production
- ✅ Avoid using public/unsecured Wi-Fi for sensitive operations
- ✅ Regularly review your habit data for unauthorized changes
- ✅ Report suspicious activity immediately

### For Developers

#### Firebase Security
- ✅ **Never commit** Firebase API keys to public repositories
- ✅ Use environment variables for sensitive configuration
- ✅ Implement proper Firestore security rules
- ✅ Enable Firebase App Check for production deployments
- ✅ Regularly rotate API keys and credentials

#### Recommended Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data isolation
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
    
    // Prevent unauthorized access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Code Security
- ✅ Sanitize all user inputs to prevent XSS attacks
- ✅ Use Content Security Policy (CSP) headers
- ✅ Implement rate limiting for API calls
- ✅ Keep dependencies up to date (run `npm audit` regularly)
- ✅ Use HTTPS for all production deployments
- ✅ Implement proper error handling (don't expose stack traces)

#### Authentication Security
- ✅ Enforce strong password requirements
- ✅ Implement account lockout after failed login attempts
- ✅ Use Firebase Authentication's built-in security features
- ✅ Validate authentication tokens on every request
- ✅ Implement session timeout mechanisms

## 🔐 Known Security Considerations

### Current Implementation

1. **Firebase API Keys in Code**
   - Firebase API keys are designed to be public for web apps
   - Security is enforced through Firestore security rules
   - Implement Firebase App Check for production to prevent abuse

2. **Client-Side Authentication**
   - Authentication state is managed client-side
   - All sensitive operations must validate auth tokens server-side
   - Firestore rules provide the security boundary

3. **Data Storage**
   - User data is stored in Firebase Firestore
   - Data is encrypted in transit (HTTPS) and at rest (Firebase default)
   - Implement proper security rules to prevent unauthorized access

### Planned Security Enhancements

- [ ] Implement Firebase App Check
- [ ] Add rate limiting for habit creation/updates
- [ ] Implement email verification for new accounts
- [ ] Add two-factor authentication (2FA)
- [ ] Implement audit logging for sensitive operations
- [ ] Add Content Security Policy headers
- [ ] Implement automated security scanning in CI/CD

## 🚨 Security Incident Response

In the event of a security incident:

1. **Immediate Actions**
   - Assess the scope and impact
   - Contain the vulnerability
   - Preserve evidence for analysis

2. **Communication**
   - Notify affected users within 72 hours
   - Provide clear guidance on protective measures
   - Publish a security advisory on GitHub

3. **Remediation**
   - Deploy security patches immediately
   - Update documentation and security policies
   - Conduct post-incident review

## 📚 Security Resources

### Firebase Security
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/web/start)
- [Firebase App Check](https://firebase.google.com/docs/app-check)

### Web Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🤝 Security Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged here (with permission):

- *No vulnerabilities reported yet*

## 📞 Contact

For security-related inquiries:
- **Email**: muthyala_sharath.reddy@uconn.edu
- **GitHub**: [@Sharathmuthyala](https://github.com/Sharathmuthyala)

For general questions and support, please use GitHub Issues (non-security related only).

---

**Last Updated**: November 2025  
**Version**: 1.0.0

*This security policy is subject to updates. Please check regularly for the latest version.*
