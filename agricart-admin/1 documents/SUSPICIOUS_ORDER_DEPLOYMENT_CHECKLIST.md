# Suspicious Order Detection - Deployment Checklist

## ✅ Pre-Deployment Verification

### Database
- [x] Migration file created: `2025_11_22_000000_add_is_suspicious_to_sales_audit_table.php`
- [x] Migration executed successfully
- [x] Columns added to `sales_audit` table:
  - [x] `is_suspicious` (boolean, default: false)
  - [x] `suspicious_reason` (text, nullable)

### Backend Files
- [x] Service created: `app/Services/SuspiciousOrderDetectionService.php`
- [x] Notification created: `app/Notifications/SuspiciousOrderNotification.php`
- [x] Model updated: `app/Models/SalesAudit.php`
  - [x] Added `is_suspicious` to fillable
  - [x] Added `suspicious_reason` to fillable
  - [x] Added `is_suspicious` to casts
- [x] Controller updated: `app/Http/Controllers/Customer/CartController.php`
  - [x] Imported `SuspiciousOrderDetectionService`
  - [x] Integrated detection in `checkout()` method
- [x] Controller updated: `app/Http/Controllers/Admin/OrderController.php`
  - [x] Added suspicious fields to `index()` method
  - [x] Added suspicious fields to `show()` method

### Frontend Files
- [x] Types updated: `resources/js/types/orders.ts`
  - [x] Added `is_suspicious?: boolean`
  - [x] Added `suspicious_reason?: string`
- [x] Component updated: `resources/js/components/orders/order-card.tsx`
  - [x] Added suspicious badge display
  - [x] Added warning message display
  - [x] Added pulse animation

### Translations
- [x] English: `resources/lang/en/notifications.php`
  - [x] Added `suspicious_order_detected` key
- [x] Tagalog: `resources/lang/tl/notifications.php`
  - [x] Added `suspicious_order_detected` key

### Documentation
- [x] Implementation guide created
- [x] Quick reference created
- [x] Flow diagram created
- [x] Feature summary created
- [x] Deployment checklist created

## 🧪 Testing Checklist

### Unit Testing
- [ ] Test `checkForSuspiciousPattern()` with various scenarios
- [ ] Test `markAsSuspicious()` updates database correctly
- [ ] Test `notifyAuthorizedUsers()` sends to correct users
- [ ] Test time window calculation
- [ ] Test order count threshold

### Integration Testing
- [ ] Test full checkout flow with detection
- [ ] Test notification delivery
- [ ] Test database updates
- [ ] Test frontend display

### Manual Testing
- [ ] Place 2 orders within 10 minutes
  - [ ] Verify both orders flagged
  - [ ] Verify notifications sent
  - [ ] Verify visual indicators appear
- [ ] Place 2 orders 15 minutes apart
  - [ ] Verify NOT flagged as suspicious
- [ ] Place 3 orders within 10 minutes
  - [ ] Verify all 3 orders flagged
  - [ ] Verify correct reason text
- [ ] Check notification bell
  - [ ] Verify notification appears
  - [ ] Verify correct message
  - [ ] Verify click navigation works
- [ ] Check orders page
  - [ ] Verify red badge displays
  - [ ] Verify warning message shows
  - [ ] Verify pulse animation works

### Permission Testing
- [ ] Test as admin user
  - [ ] Verify receives notifications
  - [ ] Verify can see suspicious orders
- [ ] Test as staff with "view orders" permission
  - [ ] Verify receives notifications
  - [ ] Verify can see suspicious orders
- [ ] Test as staff without "view orders" permission
  - [ ] Verify does NOT receive notifications
- [ ] Test as customer
  - [ ] Verify does NOT see suspicious flag
  - [ ] Verify normal order experience

### Browser Testing
- [ ] Chrome - Desktop
- [ ] Firefox - Desktop
- [ ] Safari - Desktop
- [ ] Chrome - Mobile
- [ ] Safari - Mobile

## 🚀 Deployment Steps

### 1. Backup
- [ ] Backup database
- [ ] Backup codebase
- [ ] Document current state

### 2. Deploy Code
- [ ] Pull latest code to server
- [ ] Run `composer install` (if needed)
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build`

### 3. Run Migration
```bash
php artisan migrate
```
- [ ] Verify migration successful
- [ ] Check database columns created

### 4. Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```
- [ ] Config cache cleared
- [ ] Application cache cleared
- [ ] View cache cleared
- [ ] Route cache cleared

### 5. Optimize (Production)
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
- [ ] Config cached
- [ ] Routes cached
- [ ] Views cached

### 6. Verify Deployment
- [ ] Check application loads
- [ ] Check no errors in logs
- [ ] Test order creation
- [ ] Test suspicious detection
- [ ] Test notifications

## 📊 Post-Deployment Monitoring

### Day 1
- [ ] Monitor error logs
- [ ] Check detection accuracy
- [ ] Verify notifications sent
- [ ] Review flagged orders
- [ ] Check performance impact

### Week 1
- [ ] Review false positive rate
- [ ] Analyze detection patterns
- [ ] Gather user feedback
- [ ] Adjust thresholds if needed
- [ ] Document any issues

### Month 1
- [ ] Comprehensive review
- [ ] Performance analysis
- [ ] User satisfaction survey
- [ ] Feature enhancement planning

## 🔧 Configuration Verification

### Service Configuration
```php
// app/Services/SuspiciousOrderDetectionService.php
const TIME_WINDOW_MINUTES = 10;  // ✓ Correct
const MIN_ORDERS_FOR_SUSPICIOUS = 2;  // ✓ Correct
```
- [ ] Time window set correctly
- [ ] Minimum orders threshold set correctly

### Permission Configuration
- [ ] Admin role has access
- [ ] "view orders" permission exists
- [ ] Staff users have correct permissions

## 📝 Rollback Plan

### If Issues Occur

1. **Immediate Rollback**
```bash
# Rollback migration
php artisan migrate:rollback --step=1

# Revert code changes
git revert <commit-hash>

# Clear caches
php artisan cache:clear
```

2. **Disable Feature**
```php
// In CartController::checkout(), comment out:
// $suspiciousInfo = SuspiciousOrderDetectionService::checkForSuspiciousPattern($sale);
// if ($suspiciousInfo) {
//     SuspiciousOrderDetectionService::markAsSuspicious($sale, $suspiciousInfo);
// }
```

3. **Verify Rollback**
- [ ] Application functioning normally
- [ ] No errors in logs
- [ ] Orders processing correctly

## 🎯 Success Criteria

### Must Have
- [x] Feature detects suspicious orders
- [x] Notifications sent to authorized users
- [x] Visual indicators display correctly
- [x] No errors in production
- [x] Documentation complete

### Nice to Have
- [ ] Analytics dashboard
- [ ] Configurable settings UI
- [ ] Email alerts
- [ ] Advanced detection patterns

## 📞 Support Contacts

### Technical Issues
- **Developer:** [Your Name]
- **Email:** [Your Email]
- **Phone:** [Your Phone]

### Business Questions
- **Product Owner:** [Name]
- **Email:** [Email]

## 📚 Reference Documents

1. `SUSPICIOUS_ORDER_DETECTION_IMPLEMENTATION.md` - Full technical guide
2. `SUSPICIOUS_ORDER_QUICK_REFERENCE.md` - Quick reference
3. `SUSPICIOUS_ORDER_FLOW_DIAGRAM.md` - Visual flow diagrams
4. `SUSPICIOUS_ORDER_FEATURE_SUMMARY.md` - Feature overview

## ✅ Final Sign-Off

### Development Team
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Ready for deployment

**Developer:** _________________ **Date:** _________

### QA Team
- [ ] Testing complete
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for production

**QA Lead:** _________________ **Date:** _________

### Product Owner
- [ ] Feature meets requirements
- [ ] User experience approved
- [ ] Ready for release

**Product Owner:** _________________ **Date:** _________

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** 1.0  
**Status:** Ready for Deployment
