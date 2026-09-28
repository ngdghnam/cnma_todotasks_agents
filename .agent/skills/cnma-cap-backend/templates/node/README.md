# Node.js TypeScript CAP Backend Template

Domain-driven Clean Architecture following **SOLID** principles.

## CAP Standard Structure

```
db/
├── schema/
│   └── *.cds                  # CDS schema definitions
srv/
├── src/
│   ├── common/                # Shared resources
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── enum/              # Enumerations (HttpStatusCode, BTPDestinationServices)
│   │   ├── exception/         # Custom exceptions
│   │   ├── interfaces/        # TypeScript interfaces
│   │   ├── model/             # Response models (ApiResponse)
│   │   ├── repository/        # Base repository
│   │   ├── service/           # Base service
│   │   ├── types/             # CDS event types
│   │   └── util/               # Utilities (Logger)
│   ├── domain/                # DOMAIN LOGIC (Feature-based, SRP)
│   │   └── __feature__/
│   │       ├── handler/       # Event handlers (registers events only)
│   │       ├── events/        # Event logic (OnRead*, OnBefore*, OnAfter*)
│   │       ├── model/         # Domain Entity & DTO
│   │       ├── repository/    # CQN data access
│   │       └── service/       # Business logic
│   └── infrastructure/        # INFRASTRUCTURE (External Systems, DIP)
│       ├── database/           # DBHandler
│       ├── integration/        # External services (btp/, erp/, messaging/)
│       ├── middleware/         # Request/response logging
│       └── security/          # SecurityService
├── index.ts                   # Module entry point
└── server.ts                  # Custom CAP bootstrap
```

## Directory Breakdown

### Common Layer
```
common/
├── dto/           # PaginationDTO
├── enum/          # HttpStatusCodeEnum, BTPDestinationServices
├── exception/     # ServiceException, ValidationException
├── interfaces/    # ICommon, IServiceResponse, IValidationResponseData
├── model/         # ApiResponse, ActionResponse
├── repository/    # BaseRepository
├── service/       # BaseService
├── types/         # CDS event types (ICdsRequest, CdsReadHandler, etc.)
└── util/          # DebugLogger
```

### Domain Layer (Feature-based)
```
domain/
└── __feature__/
    ├── handler/    # EventHandlers (registers events only)
    ├── events/     # Event logic (OnRead*, OnBeforeCreate*, OnAfterCreate*, etc.)
    ├── model/      # Domain Entity, CreateInput, UpdateInput
    ├── repository/ # CQN data access
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
└── security/       # SecurityService
```

## Key Principles

### SRP - Single Responsibility
- **Handler**: Event registration only (imports events, registers handlers)
- **Events**: Event logic (OnRead*, OnBeforeCreate*, OnAfterCreate*, etc.)
- **Service**: Business logic (validation, data access via repository)
- **Repository**: Data access (CQN queries)

### DIP - Dependency Inversion
- High-level modules depend on abstractions
- Constructor injection for all dependencies
- Events → Service → Repository (not direct repository access in events)

### Clean Architecture Layers

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Handler** | Event routing | `srv.on('READ', entity, handler)` |
| **Service** | Business logic | `validateCreate()`, `find()` |
| **Repository** | Data access | `findById()`, `create()` |
| **Infrastructure** | External systems | `S4HANAClient`, `DestinationCloudService` |

## Hard Rules

✅ **ALWAYS DO:**
- Use TypeScript interfaces from `#cds-models` for entity names
- Wrap responses in `ApiResponse<T>`
- Use `cds.log()` instead of `console.log`
- Implement unit tests for services
- Handle errors with `ServiceException`
- Use DIP: Events → Service → Repository

❌ **NEVER DO:**
- Write business logic in handlers (use events/ and service/)
- Use hardcoded entity names (use CDS model: `EntityName.name`)
- Return raw DB objects (map to DTO)
- Call `db.run()` directly in handlers
- Perform N+1 queries (use `.expand()`)

## Generating a New Feature

1. Copy `src/domain/__feature__/` template folder
2. Replace `__feature__` with feature name (e.g., `notification`)
3. Update imports to use CDS model for entity names:
   ```typescript
   import { MyEntity } from '#cds-models/{{namespace}}';
   super(MyEntity.name);  // Instead of hardcoded string
   ```
4. Register handlers in `server.ts`:
   ```typescript
   import MyEntityHandler from './domain/myEntity/handler/MyEntityHandler';
   cds.service.bind(MyEntityHandler);
   ```