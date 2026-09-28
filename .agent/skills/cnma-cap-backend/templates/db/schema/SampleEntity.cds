// SampleEntity - Template entity for demonstrating CAP structure
// Replace with your domain entities during project generation
// Namespace: {{namespace}}

namespace {{namespace}};

using {
    managed,
    cuid
} from '@sap/cds/common';

@cds.persistence.exists
entity SampleEntity : cuid, managed {
    // Human-readable identifier
    name        : String(100) not null;
    // Detailed description
    description : String(1000);
    // Status: active, inactive, pending
    status      : String(50) not null default 'active';
}