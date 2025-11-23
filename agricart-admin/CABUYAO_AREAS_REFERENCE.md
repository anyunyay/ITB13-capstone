# Cabuyao Barangays Reference

## Complete List of Delivery Areas

This document lists all 18 barangays in Cabuyao, Laguna that are available for logistics area assignment.

### Barangay List

1. **Baclaran**
2. **Banay-Banay**
3. **Banlic**
4. **Butong**
5. **Bigaa**
6. **Casile**
7. **Gulod**
8. **Mamatid**
9. **Marinig**
10. **Niugan**
11. **Pittland**
12. **Pulo**
13. **Sala**
14. **San Isidro**
15. **Diezmo**
16. **Barangay Uno (Poblacion)**
17. **Barangay Dos (Poblacion)**
18. **Barangay Tres (Poblacion)**

## Current Logistics Coverage (After Seeding)

| Barangay | Assigned Logistics | Count |
|----------|-------------------|-------|
| Baclaran | Maria Santos, Manuel Castro | 2 |
| Banay-Banay | Juan Dela Cruz | 1 |
| Banlic | Pedro Reyes, Gloria Ortiz | 2 |
| Butong | Ana Garcia | 1 |
| Bigaa | Carlos Mendoza, Alejandro Ruiz | 2 |
| Casile | Rosa Fernandez, Francisco Navarro | 2 |
| Gulod | Miguel Torres | 1 |
| Mamatid | Sofia Ramirez | 1 |
| Marinig | Diego Lopez, Javier Gutierrez | 2 |
| Niugan | Carmen Gonzales | 1 |
| Pittland | Ricardo Flores | 1 |
| Pulo | Elmo V. Republica, Patricia Vargas | 2 |
| Sala | Judel Macasinag, Roberto Silva | 2 |
| San Isidro | Elena Cruz | 1 |
| Diezmo | Fernando Diaz | 1 |
| Barangay Uno (Poblacion) | Isabel Morales | 1 |
| Barangay Dos (Poblacion) | Antonio Ramos | 1 |
| Barangay Tres (Poblacion) | Lucia Herrera | 1 |
| **N/A (Unassigned)** | Teresa Jimenez, Beatriz Romero | 2 |

## Usage in Code

### Backend (PHP)
```php
// Array of all Cabuyao areas
$cabuyaoAreas = [
    'Baclaran',
    'Banay-Banay',
    'Banlic',
    'Butong',
    'Bigaa',
    'Casile',
    'Gulod',
    'Mamatid',
    'Marinig',
    'Niugan',
    'Pittland',
    'Pulo',
    'Sala',
    'San Isidro',
    'Diezmo',
    'Barangay Uno (Poblacion)',
    'Barangay Dos (Poblacion)',
    'Barangay Tres (Poblacion)',
];

// Validation rule
'assigned_area' => 'nullable|string|in:' . implode(',', $cabuyaoAreas)
```

### Frontend (TypeScript/React)
```typescript
// Constant array for dropdown
const CABUYAO_AREAS = [
    'Baclaran',
    'Banay-Banay',
    'Banlic',
    'Butong',
    'Bigaa',
    'Casile',
    'Gulod',
    'Mamatid',
    'Marinig',
    'Niugan',
    'Pittland',
    'Pulo',
    'Sala',
    'San Isidro',
    'Diezmo',
    'Barangay Uno (Poblacion)',
    'Barangay Dos (Poblacion)',
    'Barangay Tres (Poblacion)',
];

// Usage in Select component
<Select>
  {CABUYAO_AREAS.map((area) => (
    <SelectItem key={area} value={area}>
      {area}
    </SelectItem>
  ))}
</Select>
```

## Area Statistics

- **Total Barangays**: 18
- **Poblacion Barangays**: 3 (Uno, Dos, Tres)
- **Regular Barangays**: 15
- **Total Logistics Assigned**: 25
- **Unassigned Logistics**: 2
- **Average Logistics per Area**: 1.39
- **Most Covered Areas**: Baclaran, Banlic, Bigaa, Casile, Marinig, Pulo, Sala (2 each)

## Geographic Notes

### Poblacion Areas
The three Poblacion barangays (Uno, Dos, Tres) represent the town center of Cabuyao:
- **Barangay Uno (Poblacion)** - First district
- **Barangay Dos (Poblacion)** - Second district  
- **Barangay Tres (Poblacion)** - Third district

### Coverage Strategy
Current seeding strategy ensures:
1. Every barangay has at least one assigned logistic
2. High-traffic areas (Sala, Pulo, Baclaran) have 2 logistics for redundancy
3. 2 logistics remain unassigned for flexibility and testing N/A display

## Future Enhancements

### Potential Features
1. **Area Grouping**: Group nearby barangays for efficient routing
2. **Population Data**: Weight assignments based on barangay population
3. **Distance Matrix**: Calculate optimal logistics-to-area assignments
4. **Load Balancing**: Automatically distribute orders based on current workload
5. **Coverage Heatmap**: Visual representation of logistics coverage

### Data Sources
- Official Cabuyao City government website
- Philippine Statistics Authority (PSA)
- Local government unit (LGU) records

## Maintenance

### Adding New Areas
If new barangays are added to Cabuyao:

1. Update the constant arrays in:
   - `resources/js/components/logistics/area-assignment-modal.tsx`
   - `database/seeders/UserSeeder.php`
   
2. Update validation rules in:
   - `app/Http/Controllers/Admin/LogisticController.php`

3. Update this reference document

### Removing Areas
If barangays are merged or renamed:

1. Update all constant arrays
2. Migrate existing assignments to new names
3. Update documentation

## Related Files

- `resources/js/components/logistics/area-assignment-modal.tsx` - Frontend dropdown
- `database/seeders/UserSeeder.php` - Seeder with area assignments
- `app/Http/Controllers/Admin/LogisticController.php` - Backend validation
- `LOGISTICS_AREA_ASSIGNMENT_IMPLEMENTATION.md` - Feature documentation
- `SEEDER_UPDATES_SUMMARY.md` - Seeder changes documentation
