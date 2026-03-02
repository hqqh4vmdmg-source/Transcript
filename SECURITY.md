# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Transcript Generator seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@transcriptgenerator.com.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information (as much as you can provide) to help us better understand the nature and scope of the possible issue:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

We follow the principle of Coordinated Vulnerability Disclosure.

## Security Measures

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Secure session management

### Data Protection
- PostgreSQL for secure data storage
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Network Security
- CORS configuration
- HTTPS enforcement (in production)
- Rate limiting (recommended for production)

### Best Practices
- Regular dependency updates
- Security audits
- Code reviews
- Automated testing

## Known Security Considerations

### Development Mode
In development mode, the application may run with relaxed security settings. These are not suitable for production:

- CORS allows all origins
- Detailed error messages are exposed
- Database runs on default credentials

### Production Deployment
For production deployment, ensure:

- Use strong, unique JWT secrets
- Configure proper CORS settings
- Use environment variables for sensitive data
- Enable HTTPS
- Set up proper database credentials
- Implement rate limiting
- Regular security updates
- Monitor logs for suspicious activity

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. We will:

1. Confirm the vulnerability
2. Determine affected versions
3. Prepare patches
4. Release updates
5. Notify users through GitHub Security Advisories

## Acknowledgments

We would like to thank the following individuals for responsibly disclosing security issues:

(List will be updated as reports are received)
