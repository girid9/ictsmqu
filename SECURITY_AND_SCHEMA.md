# Quiz Battle Data Model & Security

## Architecture: Lovable Cloud (Supabase)

This project uses **Lovable Cloud** (powered by Supabase) for real-time multiplayer quiz battles, NOT Firebase.

## Database Schema

### Tables

#### `battle_rooms`
Stores battle room state with real-time updates:
- `id` (uuid, PK) - Unique room identifier
- `room_code` (text, unique) - 6-character alphanumeric code for joining
- `host_id` (uuid) - User ID of the host player
- `host_display_name` (text) - Host's nickname (1-20 chars)
- `guest_id` (uuid, nullable) - User ID of the guest player
- `guest_display_name` (text, nullable) - Guest's nickname (1-20 chars)
- `subject_id` (text) - Selected subject for the battle
- `topic_name` (text) - Selected topic for the battle
- `status` (text) - Current state: `waiting`, `ready`, `active`, `finished`
- `current_question` (integer) - Index of current question (0-9)
- `host_score` (integer) - Host's score (0-10)
- `guest_score` (integer) - Guest's score (0-10)
- `question_ids` (text[]) - Array of selected question IDs (max 10)
- `created_at` (timestamp) - Room creation time
- `started_at` (timestamp, nullable) - Battle start time
- `finished_at` (timestamp, nullable) - Battle end time

#### `battle_answers`
Stores individual player answers:
- `id` (uuid, PK) - Unique answer identifier
- `room_id` (uuid, FK) - Reference to battle room
- `user_id` (uuid) - Player who submitted the answer
- `question_index` (integer) - Question number (0-9)
- `selected_answer` (text) - The answer chosen
- `is_correct` (boolean) - Whether the answer was correct
- `answered_at` (timestamp) - When the answer was submitted

## Security (Row-Level Security Policies)

### `battle_rooms` Policies
- **SELECT**: Anyone can view battle rooms (needed for joining)
- **INSERT**: Authenticated users can create rooms (must be the host)
- **UPDATE**: Only host or guest can update their room

### `battle_answers` Policies
- **SELECT**: Anyone can view battle answers (for revealing results)
- **INSERT**: Players can insert their own answers only

## Validation & Constraints

### Database-Level Validation (Triggers)
A validation trigger ensures:
- Room codes are exactly 6 uppercase alphanumeric characters
- Display names are 1-20 characters
- Scores are between 0-10
- Current question is between 0-10
- Status is one of: `waiting`, `ready`, `active`, `finished`
- Maximum 10 questions per battle
- Timestamps are set correctly when status changes

### Application-Level Validation (Zod)
Client-side validation in `src/lib/battleValidation.ts`:
- Input sanitization before database operations
- Type-safe schema validation
- User-friendly error messages

## Data Cleanup

### Automatic Cleanup Edge Function
`supabase/functions/cleanup-old-battles/index.ts`:
- Deletes finished rooms older than 24 hours
- Deletes abandoned waiting rooms older than 1 hour
- Removes associated answers
- Can be triggered manually or via cron job

**To run manually:**
```bash
# Via Supabase client
const { data } = await supabase.functions.invoke('cleanup-old-battles');
```

**To schedule (via external service like Vercel Cron or GitHub Actions):**
```yaml
# Example: GitHub Actions workflow
name: Cleanup Old Battles
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST \
            https://[project-ref].supabase.co/functions/v1/cleanup-old-battles \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

## Real-Time Synchronization

All battle state updates use Supabase Realtime:
- Room status changes (waiting → ready → active → finished)
- Player joins/leaves
- Score updates
- Question advancement
- Answer submissions

## Error Handling

1. **Network Errors**: Detected via subscription status callbacks
2. **Validation Errors**: Caught at database trigger level and client validation
3. **Race Conditions**: Prevented via database constraints (unique room codes, etc.)
4. **Cleanup**: All subscriptions properly unsubscribed on component unmount

## Security Best Practices

✅ No sensitive data in client code  
✅ Row-Level Security enforced at database level  
✅ Input validation on both client and server  
✅ Unique constraints prevent duplicate room codes  
✅ Triggers validate data integrity  
✅ Real-time subscriptions use secure channels  
✅ Cleanup function removes stale data  
✅ No SQL injection vulnerabilities (parameterized queries only)

## Testing Security

1. **RLS Policies**: Test with different user IDs to ensure proper isolation
2. **Validation**: Try submitting invalid data (scores > 10, invalid room codes)
3. **Race Conditions**: Test with two simultaneous joins
4. **Cleanup**: Verify old rooms are deleted after timeout periods

## Migration History

All database changes are tracked in `supabase/migrations/`:
- Initial schema creation
- RLS policy setup
- Validation triggers
- Indexes for performance
- Constraint additions
