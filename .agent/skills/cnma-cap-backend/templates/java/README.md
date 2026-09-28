# Java CAP Backend Template

Domain-driven Clean Architecture following **SOLID** principles with Lombok.

## CAP Standard Structure

```
db/
├── schema/
│   └── *.cds                  # CDS schema definitions
srv/
├── src/main/java/cnma/{{module_name}}/
│   ├── common/                # Shared resources
│   ├── config/                # Application configuration
│   ├── domain/                # DOMAIN LOGIC (Feature-based, SRP)
│   │   └── __feature__/
│   │       ├── handler/       # Event handlers (@Handler annotations)
│   │       ├── events/        # Event logic (OnRead*, OnBefore*, OnAfter*)
│   │       ├── model/         # Domain Entity & DTO
│   │       ├── repository/    # CQN data access
│   │       └── service/       # Business logic (@Service)
│   └── infrastructure/        # INFRASTRUCTURE (External Systems, DIP)
│       ├── database/           # DBHandler
│       ├── integration/        # External services (btp/, erp/, messaging/)
│       ├── middleware/         # Logging middleware
│       └── security/          # SecurityService, UserContext
├── src/main/resources/
│   └── application.yaml       # Spring Boot configuration
└── {ServiceName}.cds          # Service definition
```

## Directory Breakdown

### Common Layer
```
common/
├── dto/            # Data Transfer Objects
├── enums/          # HttpStatusCode (enum with status codes)
├── exception/      # ServiceException, ValidationException, NotFoundException
├── interfaces/     # ICommon, IApiResponse, IServiceResponse
├── model/          # ApiResponse, ServiceResponse
├── service/        # BaseService
└── util/           # AppLogger
```

### Domain Layer (Feature-based)
```
domain/
└── __feature__/
    ├── handler/    # EventHandlers (@Handler, @Service)
    ├── events/     # Event logic (OnRead*, OnBeforeCreate*, OnAfterCreate*, etc.)
    ├── model/      # Domain Entity, DomainDTO
    ├── repository/ # PersistenceService data access
    └── service/    # Business logic
```

### Infrastructure Layer
```
infrastructure/
├── database/       # DBHandler
├── integration/
│   ├── btp/        # DestinationCloudService
│   ├── erp/        # S4HANAClient
│   └── messaging/  # MessagePublisher
├── middleware/     # BTPServiceLoggingMiddleware
└── security/       # SecurityService, UserContext
```

## Key Principles

### SRP - Single Responsibility
- **Handler**: Event routing via `@Handler` annotation (route to events/)
- **Events**: Event logic (OnRead*, OnBeforeCreate*, OnAfterCreate*, etc.)
- **Service**: Business logic (@Service, @RequiredArgsConstructor)
- **Repository**: CQN data access (injected PersistenceService)

### DIP - Dependency Inversion
- Constructor injection ONLY using Lombok `@RequiredArgsConstructor`
- Never use `@Autowired` on fields
- Services depend on Repository interfaces, not implementations
- Handlers delegate to Services

### Clean Architecture Layers

| Layer | Annotation | Responsibility |
|-------|------------|-----------------|
| **Handler** | `@Handler` | Event interception |
| **Service** | `@Service` | Business logic |
| **Repository** | `@Repository` | CQN persistence via PersistenceService |

## Hard Rules

✅ **ALWAYS DO:**
- Use Lombok (`@RequiredArgsConstructor`, `@Slf4j`, `@Data`)
- Return `Result` via `context.setResult()` in `@On` events
- Use `CqnAnalyzer` for parameter extraction
- Define Entities in `.cds` files before writing Java
- Use `ServiceException` (never plain `RuntimeException`)
- Constructor injection only (@RequiredArgsConstructor)

❌ **NEVER DO:**
- Create "God Handler" (> 500 lines)
- Use field injection (`@Autowired`)
- Call `db.run()` directly in handlers
- Throw `RuntimeException` (use `ServiceException`)
- Perform N+1 queries (use batch queries)
- Use JPA/Hibernate `@Entity` (use CDS generated interfaces)

## Generating a New Feature

1. Copy `src/main/java/cnma/{{module_name}}/domain/__feature__/` template package
2. Replace `__feature__` with feature name (e.g., `notification`)
3. Update entity references in handler/service/repository
4. Register handler in Spring context (auto-discovered via `@Component`)

## Java/Node.js Parity

Both implementations use **IDENTICAL** folder structure at the package level:

| Node.js | Java |
|---------|------|
| `srv/src/domain/__feature__/handler/` | `domain/__feature__/handler/` |
| `srv/src/domain/__feature__/events/` | `domain/__feature__/events/` |
| `srv/src/domain/__feature__/model/` | `domain/__feature__/model/` |
| `srv/src/domain/__feature__/repository/` | `domain/__feature__/repository/` |
| `srv/src/domain/__feature__/service/` | `domain/__feature__/service/` |
| `srv/src/infrastructure/` | `infrastructure/` |
| `srv/src/common/` | `common/` |