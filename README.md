# Personal AI-Privacy Capsule (PAC)

## Project Summary

Personal AI-Privacy Capsule (PAC) is a comprehensive privacy-focused application designed to address the growing risks of data exposure in AI interactions. By detecting, sanitizing, and reinserting Personally Identifiable Information (PII) entirely on-device, PAC ensures that sensitive information never leaves the user’s control. This solution empowers individuals and organizations to harness the power of AI while remaining compliant with privacy regulations such as GDPR and CCPA.

## Core Features & Functionality

- Text Privacy Protection: Regex PII detection, sanitization, AI proxy, reinsertion.
- Image Privacy Protection: Face detection, blurring, pixelation, optional AI vision.
- Audit & Compliance: Logging, CSV export, signed receipts, TTL vault.
- Security Features: HMAC authentication, key versioning, rate limiting, CORS.
- User Interface: React Native app, dark theme, configurable settings, real-time feedback.


## Key Benefits

- Zero Trust Architecture: No external service sees raw PII.
- User Control: Full ownership of privacy decisions.
- Deterministic Processing: Predictable privacy enforcement.
- Compliance Ready: Built-in audit trails and deletion verification.
- Cross-Platform: Works on iOS and Android.
- Extensible: Modular design supports future PII types.


## Technology 

### Development Tools

- Backend: Python 3.11+, FastAPI, Uvicorn, pytest, Docker, Docker Compose.
- Frontend: React Native, Expo, TypeScript, Babel, Metro Bundler.
- Environment: VS Code, Git, CLI.


### APIs

- Internal REST APIs: /ai/complete, /ai/vision, /receipts/process, /receipts/verify, /audit/export, /image/blur.
- External Services: OpenAI API, Vision AI APIs, Redis.
- Mobile APIs: Expo Image Picker, Expo Manipulator, Expo Sharing, Expo File System.


### Assets

- Data Assets: Regex patterns, Haar cascades, test data, audit logs.
- UI Assets: Dark theme, icon system, reusable components.
- Config Assets: Environment variables, SQLite schema, Docker configs.


### Libraries

- Python: fastapi, uvicorn, pydantic, redis, pandas, pytest, opencv, Pillow, numpy.
- React Native: react, react-navigation, zustand, expo modules.


## Relevant Problem Statement

Theme: (7) Privacy Meets AI: Building a Safer Digital Future

In today's AI-driven world, users face significant privacy risks when interacting with cloud-based AI services. Sensitive personal data, including emails, phone numbers, and images, are often transmitted to third-party servers without sufficient safeguards, exposing users to identity theft, data leakage, and regulatory non-compliance. 