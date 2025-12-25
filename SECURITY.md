# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@dimm.ai.

You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

## Preferred Languages

We prefer all communications to be in English or Korean.

## Disclosure Policy

- We will confirm receipt of your vulnerability report
- We will provide an estimated timeline for a fix
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Update Process

1. Vulnerability is reported and confirmed
2. Fix is developed and tested
3. Security advisory is prepared
4. Fix is released with security patch
5. Public disclosure is made

## Bug Bounty Program

We are currently developing a bug bounty program. Details will be announced soon.

## Security Best Practices

When using DIMM:

1. **Never share private keys** - Agents should never have access to main wallet private keys
2. **Start with conservative limits** - Begin with small transaction and daily limits
3. **Monitor agent activity** - Regularly check agent transactions and spending
4. **Use hardware wallets** - Store main wallet on hardware devices when possible
5. **Revoke unused agents** - Disable agents that are no longer needed
6. **Update regularly** - Keep DIMM SDK and program updated to latest versions

## Known Security Considerations

### Smart Contract Risks

- Program has not yet undergone professional security audit
- Use with caution on mainnet
- Test thoroughly on devnet first

### Agent Security

- Agents can only perform actions within granted permissions
- Daily and per-transaction limits provide additional safety
- Main wallet always retains full control

### cNFT Considerations

- Merkle tree manipulation could affect agent verification
- Tree authority must be properly secured
- Backup merkle roots for disaster recovery

## Audit Status

- [ ] Internal security review - In Progress
- [ ] External security audit - Planned
- [ ] Bug bounty program - Planned
- [ ] Formal verification - Future

## Contact

- Security Email: security@dimm.ai
- General Email: team@dimm.ai
- Discord: (coming soon)

---

Thank you for helping keep DIMM and our users safe!


