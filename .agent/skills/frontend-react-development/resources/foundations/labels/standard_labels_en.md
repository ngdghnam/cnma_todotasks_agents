# Standard Labels — Version 2

## Purpose
Uniform terminology across all SAP BTP applications. Deviations require central list update.

## General Terminology

| Standard Label | Do Not Use | Context |
|:-------------- |:---------- |:------- |
| **Supplier Name** | Vendor, Vendor Name | Business entity providing goods |
| **Purchase Order** | PO, Purchasing Document | Document for ordering goods |
| **Order Date** | Created Date, Date Ordered | When the order was placed |
| **Delivery Date** | Due Date, Expected Date | Expected arrival of goods |
| **Amount** | Total, Price | Monetary value of the order |
| **Payment Terms** | Terms, Net Terms | Payment conditions |
| **Status** | State | Current lifecycle position |

## Status Labels

| Standard Label | Do Not Use | Maps To |
|:-------------- |:---------- |:------- |
| **Open** | New, Created | `status-new` |
| **In Progress** | Processing, In Work | `status-progress` |
| **Approved** | Released, Accepted | `status-released` |
| **Completed** | Done, Finished | `status-completed` |
| **Rejected** | Cancelled, Declined | `status-obsoleted` |

## Button Labels

| Standard Label | Do Not Use | Context |
|:-------------- |:---------- |:------- |
| **Create** | Add New, New | Primary creation action |
| **Save** | Submit, Update | Persist changes |
| **Cancel** | Abort, Go Back | Negative path |
| **Delete** | Remove, Destroy | Destructive action |
| **Export** | Download | Data export |
| **Upload** | Import | File upload |

## Localization
- English is the **master** list
- German translations must be semantically equivalent
- Never mix languages in the same view
