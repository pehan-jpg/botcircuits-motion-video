# Audio generation list: PaymentsUseCase

ElevenLabs could not be reached from the build session (`ELEVENLABS_API_KEY` is not set and the API host is unreachable), so no audio was generated. Generate the files below in ElevenLabs and drop them into the folders shown. MP3 or WAV are both fine; keep the base file name.

- Voice lines: `public/audio/vo/`
- Sound effects: `public/audio/sfx/`
- Music sections: `public/audio/music/`

All times come from `src/content.ts` (the code is the truth), at 60 fps: frame = seconds x 60. The video is **27.35 s (1641 frames)**, not 26.5 s.

## Differences from the audio brief

The video changed after the brief was written. These cues were adapted:

1. Video length is 27.35 s, so every later cue moves (for example scenario boundaries are 17.40, 18.80, 20.20, 21.60, 23.00 s, still 1.4 s apart).
2. `sfx_pill_form` is dropped: the pill and send button were removed from the intro.
3. `sfx_squircle` and `sfx_white` are replaced by one `sfx_phone_out`: the ending now fades the phone out (23.00 to 23.60 s) instead of a circle filling the frame.
4. The Chats list has 6 rows, so there are 6 list ticks, 70 ms apart (4.10 to 4.45 s).
5. Voice line 4 is split into two takes (`vo_04a_made`, `vo_04b_proof`) because "made" (15.80 s) and "proof" (17.00 s) are 1.2 s apart; one take at 2.3 words per second cannot hit both.
6. `sfx_orb_travel` is split into three legs, because the orb stops at each node (no sound while nothing moves). The curves draw in 0.65 s, so `sfx_line_draw` is 0.65 s, not 1.8 s.
7. Music section boundaries move to 4.15, 13.15 and 23.00 s. The section D swell peaks at about 23.30 s and is near silent by 23.60 s, when the phone has faded out.

## Voice

One voice for every line. Calm, clear, warm, neutral international English, medium low pitch, about 2.3 words per second, no hype. Model: latest multilingual or v3. Stability about 50 percent, similarity about 75 percent, style 0 to 20 percent, speaker boost on. Generate each line as its own take. The text below is exactly what to send ("B two B" is spelled out on purpose).

| File | Text to send | Start (s) | Start frame | Must land | Max length (s) |
|---|---|---|---|---|---|
| `vo_01_theme` | B two B payments, made easier. | 0.50 | 30 | ends by 2.90 s (frame 174), before the headline clears at 3.00 s | 2.4 |
| `vo_02_invoice` | Send the invoice. The agent reads it. | 6.40 | 384 | "reads it" lands at 8.15 s (frame 489) as the first field row reveals | 2.2 |
| `vo_03_approve` | It checks the details. You approve. | 10.20 | 612 | "approve" ends by 12.80 s (frame 768), before the tap on Approve at 12.90 s (frame 774) | 2.6 |
| `vo_04a_made` | The payment is made. | 14.70 | 882 | "made" lands at 15.80 s (frame 948) as the check mark draws at Supplier | 1.3 |
| `vo_04b_proof` | You get proof. | 16.20 | 972 | "proof" lands at 17.00 s (frame 1020) as the Proof of payment bubble appears | 1.0 |
| `vo_05a_status` | Check status. | 17.55 | 1053 | finishes by 18.75 s (frame 1125), before the Bulk scenario at 18.80 s | 1.2 |
| `vo_05b_bulk` | Pay in bulk. | 18.95 | 1137 | finishes by 20.15 s (frame 1209), before the Duplicate scenario at 20.20 s | 1.2 |
| `vo_05c_duplicates` | Catch duplicates. | 20.35 | 1221 | finishes by 21.55 s (frame 1293), before the Scheduled scenario at 21.60 s | 1.2 |
| `vo_05d_schedule` | Schedule payments. | 21.75 | 1305 | finishes by 22.95 s (frame 1377), before the phone fades out at 23.00 s | 1.2 |
| `vo_06_brand` | BotCircuits. | 24.45 | 1467 | optional, over the logo blur in (24.35 s, frame 1461) | 1.0 |

## Sound effects

Soft, close and clean: glass, paper, air. No cartoon sounds, no beeps, no attention-seeking risers, nothing that imitates a real app's notification. Rows marked "reuse" need no new file.

| File | Motion on screen | Motion frame | Cue frame | Cue start (s) | ElevenLabs prompt | Length (s) | Note |
|---|---|---|---|---|---|---|---|
| `sfx_intro_air` | Headline blurs in, character by character | 12 | 12 | 0.20 | very soft airy breath swell, gentle, clean, slight high shimmer, no whoosh | 0.9 |  |
| `sfx_line_in` | Second line fades up | 93 | 93 | 1.55 | tiny soft air tick, subtle, clean | 0.3 |  |
| `sfx_glass_grow` | Frosted glass phone rises (3.15 to 3.95 s) | 189 | 189 | 3.15 | smooth glassy rising whoosh, frosted glass sliding, soft, clean, no bass | 0.9 | replaces the pill expanding; the pill step no longer exists |
| `sfx_glass_settle` | Glass resolves into the solid screen (3.95 to 4.15 s) | 237 | 237 | 3.95 | soft low muted thud, gentle, like glass setting on a table | 0.4 |  |
| `sfx_list_tick_1` | Chats row 1 appears | 246 | 246 | 4.10 | tiny soft wooden tick, very short, delicate, UI | 0.12 | one file is enough if you prefer; it will be pitched up a little per row in the mix |
| `sfx_list_tick_2` | Chats row 2 appears | 250 | 250 | 4.17 | tiny soft wooden tick, very short, delicate, UI | 0.12 | same prompt, or reuse sfx_list_tick_1 |
| `sfx_list_tick_3` | Chats row 3 appears | 254 | 254 | 4.24 | tiny soft wooden tick, very short, delicate, UI | 0.12 | same prompt, or reuse sfx_list_tick_1 |
| `sfx_list_tick_4` | Chats row 4 appears | 259 | 259 | 4.31 | tiny soft wooden tick, very short, delicate, UI | 0.12 | same prompt, or reuse sfx_list_tick_1 |
| `sfx_list_tick_5` | Chats row 5 appears | 263 | 263 | 4.38 | tiny soft wooden tick, very short, delicate, UI | 0.12 | same prompt, or reuse sfx_list_tick_1 |
| `sfx_list_tick_6` | Chats row 6 appears | 267 | 267 | 4.45 | tiny soft wooden tick, very short, delicate, UI | 0.12 | same prompt, or reuse sfx_list_tick_1 |
| `sfx_pointer_glide` | Hand pointer moves to the Northbridge Payments row (4.85 to 5.40 s) | 291 | 291 | 4.85 | very faint cloth swish, soft air movement | 0.55 |  |
| `sfx_tap` | Tap on the agent row, row turns grey | 327 | 327 | 5.45 | soft fingertip tap on a phone screen, dry, close, minimal | 0.15 |  |
| `sfx_push` | List pushes left, conversation slides in (5.70 to 6.25 s) | 342 | 342 | 5.70 | short soft swipe whoosh, low, smooth | 0.5 | pan right to left |
| `sfx_file_drop` | Invoice file bubble drops in | 396 | 396 | 6.60 | soft paper drop with a gentle pop, clean, close | 0.4 | the attach button flashes at 6.45 s |
| `sfx_tick_read` | Ticks turn blue (second tick 6.95 s, blue 7.15 s) | 429 | 429 | 7.15 | two tiny soft clicks in quick succession, delicate | 0.2 |  |
| `sfx_msg_in` | Agent message replaces the typing dots | 456 | 456 | 7.60 | original soft message pop, gentle, rounded, not like any known messaging app | 0.3 | do not imitate any app notification |
| `sfx_push_in` | Camera push into the data card (7.85 to 8.65 s) | 471 | 471 | 7.85 | slow low soft swell, smooth air movement, no tone | 0.8 |  |
| `sfx_field_tick_1` | Field row 1 reveals | 489 | 489 | 8.15 | tiny soft key tick, delicate, UI | 0.1 | one file is enough; pitched up per row in the mix |
| `sfx_field_tick_2` | Field row 2 reveals | 501 | 501 | 8.35 | tiny soft key tick, delicate, UI | 0.1 | same prompt, or reuse sfx_field_tick_1 |
| `sfx_field_tick_3` | Field row 3 reveals | 513 | 513 | 8.55 | tiny soft key tick, delicate, UI | 0.1 | same prompt, or reuse sfx_field_tick_1 |
| `sfx_field_tick_4` | Field row 4 reveals | 576 | 576 | 9.60 | tiny soft key tick, delicate, UI | 0.1 | same prompt, or reuse sfx_field_tick_1 |
| `sfx_field_tick_5` | Field row 5 reveals | 585 | 585 | 9.75 | tiny soft key tick, delicate, UI | 0.1 | same prompt, or reuse sfx_field_tick_1 |
| `sfx_count` | Amount counts up (8.55 to 9.10 s) | 513 | 513 | 8.55 | very fast light ticking, rising, soft, like a mechanical counter | 0.55 |  |
| `sfx_lock` | Amount locks, lime highlight wipes in | 546 | 546 | 9.10 | single soft glassy chime, short, warm, clean | 0.6 |  |
| `sfx_check_1` | Check mark 1 ticks in | 636 | 636 | 10.60 | soft glass ping, short, rounded, pleasant, pitched on D | 0.4 | rising scale D, F sharp, A |
| `sfx_check_2` | Check mark 2 ticks in | 660 | 660 | 11.00 | soft glass ping, short, rounded, pleasant, pitched on F sharp | 0.4 | rising scale D, F sharp, A |
| `sfx_check_3` | Check mark 3 ticks in | 684 | 684 | 11.40 | soft glass ping, short, rounded, pleasant, pitched on A | 0.4 | rising scale D, F sharp, A |
| `sfx_slide_up` | Approve and Reject bars slide up | 735 | 735 | 12.25 | soft short slide, smooth, subtle | 0.3 |  |
| `sfx_pointer_glide2` | Pointer moves to Approve (12.30 to 12.80 s) | 738 | 738 | 12.30 | very faint cloth swish, soft | 0.5 |  |
| `sfx_tap_approve` | Tap and ripple on Approve | 774 | 774 | 12.90 | soft confident tap with a faint low body, close, dry | 0.25 |  |
| `sfx_orb_form` | Approve button shrinks into the orb (13.15 to 13.55 s) | 789 | 789 | 13.15 | small soft compress then pop, gentle, bubble condensing into a droplet | 0.4 |  |
| `sfx_pullback` | Phone blurs and scales away, camera pulls out (13.15 to 13.95 s) | 789 | 789 | 13.15 | smooth low whoosh moving away, soft air, no tone | 0.9 |  |
| `sfx_line_draw` | Curves draw themselves from the top (13.95 to 14.60 s) | 837 | 837 | 13.95 | thin continuous soft shimmer, like a fine line being drawn, very quiet, gently rising | 0.65 | the curves draw in 0.65 s, not 1.8 s |
| `sfx_orb_travel_1` | Orb moves to Your account (13.55 to 14.00 s) | 813 | 813 | 13.55 | smooth soft sweep with a faint comet tail, airy, rising slightly | 0.45 | split into three legs: the orb stops at each node |
| `sfx_orb_travel_2` | Orb travels to Payment provider (14.35 to 14.95 s) | 861 | 861 | 14.35 | smooth soft sweep with a faint comet tail, airy, rising slightly | 0.6 |  |
| `sfx_orb_travel_3` | Orb travels to Supplier (15.10 to 15.70 s) | 906 | 906 | 15.10 | smooth soft sweep with a faint comet tail, airy, rising slightly, a little brighter | 0.6 |  |
| `sfx_node_ping_1` | Ring pulse at Your account | 840 | 840 | 14.00 | soft sonar ping, rounded, short, glassy | 0.5 |  |
| `sfx_node_ping_2` | Ring pulse at Payment provider | 897 | 897 | 14.95 | soft sonar ping, rounded, short, glassy, a major third higher | 0.5 | a third higher than sfx_node_ping_1 |
| `sfx_roll_1` | Status line rolls in: "Payment initiated" | 840 | 840 | 14.00 | tiny soft tick, delicate, like a slim wheel clicking | 0.1 |  |
| `sfx_roll_2` | Status line rolls to "Sent to payment provider" | 897 | 897 | 14.95 | tiny soft tick, delicate, like a slim wheel clicking | 0.1 | or reuse sfx_roll_1 |
| `sfx_roll_3` | Status line rolls to "Paid" | 942 | 942 | 15.70 | tiny soft tick, delicate, like a slim wheel clicking | 0.1 | or reuse sfx_roll_1 |
| `sfx_arrive` | Orb arrives at Supplier, check draws (15.80 s), gradient blooms (15.70 to 16.70 s) | 942 | 942 | 15.70 | a crisp soft glass ping resolving into a warm gentle bloom, clean, satisfying but understated | 1.2 |  |
| `sfx_return` | Supplier node morphs into the chat bubble, phone returns (16.55 to 17.15 s) | 993 | 993 | 16.55 | soft low whoosh, smooth, then a gentle pop | 0.6 |  |
| `sfx_msg_in2_a` | "Payment sent" message appears | 1014 | 1014 | 16.90 | reuse sfx_msg_in | 0.3 | no new file needed |
| `sfx_msg_in2_b` | Proof of payment document appears | 1020 | 1020 | 17.00 | reuse sfx_msg_in, slightly lower in pitch | 0.3 | no new file needed |
| `sfx_blur_through_status` | Blur through into the Status scenario | 1044 | 1044 | 17.40 | very soft short whoosh, blurred air, low | 0.4 | one file reused four times is fine; pan right to left |
| `sfx_chip_roll_status` | Scenario chip shows "Status" | 1044 | 1044 | 17.40 | tiny soft tick, delicate | 0.1 | the label roll starts with the transition, so the cue sits on the boundary, not 0.1 s after |
| `sfx_bubble_status_out` | Status: outgoing bubble | 1056 | 1056 | 17.60 | reuse sfx_msg_in, quiet | 0.25 | no new file needed |
| `sfx_bubble_status_in` | Status: agent reply bubble | 1074 | 1074 | 17.90 | reuse sfx_msg_in, quiet, slightly lower | 0.25 | no new file needed |
| `sfx_blur_through_bulk` | Blur through into the Bulk scenario | 1128 | 1128 | 18.80 | very soft short whoosh, blurred air, low | 0.4 | one file reused four times is fine; pan right to left |
| `sfx_chip_roll_bulk` | Scenario chip shows "Bulk" | 1128 | 1128 | 18.80 | tiny soft tick, delicate | 0.1 | the label roll starts with the transition, so the cue sits on the boundary, not 0.1 s after |
| `sfx_bubble_bulk_out` | Bulk: outgoing bubble | 1140 | 1140 | 19.00 | reuse sfx_msg_in, quiet | 0.25 | no new file needed |
| `sfx_bubble_bulk_in` | Bulk: agent reply bubble | 1158 | 1158 | 19.30 | reuse sfx_msg_in, quiet, slightly lower | 0.25 | no new file needed |
| `sfx_blur_through_duplicate` | Blur through into the Duplicate scenario | 1212 | 1212 | 20.20 | very soft short whoosh, blurred air, low | 0.4 | one file reused four times is fine; pan right to left |
| `sfx_chip_roll_duplicate` | Scenario chip shows "Duplicate" | 1212 | 1212 | 20.20 | tiny soft tick, delicate | 0.1 | the label roll starts with the transition, so the cue sits on the boundary, not 0.1 s after |
| `sfx_bubble_duplicate_out` | Duplicate: outgoing bubble | 1224 | 1224 | 20.40 | reuse sfx_msg_in, quiet | 0.25 | no new file needed |
| `sfx_bubble_duplicate_in` | Duplicate: agent reply bubble | 1242 | 1242 | 20.70 | reuse sfx_msg_in, quiet, slightly lower | 0.25 | no new file needed |
| `sfx_blur_through_scheduled` | Blur through into the Scheduled scenario | 1296 | 1296 | 21.60 | very soft short whoosh, blurred air, low | 0.4 | one file reused four times is fine; pan right to left |
| `sfx_chip_roll_scheduled` | Scenario chip shows "Scheduled" | 1296 | 1296 | 21.60 | tiny soft tick, delicate | 0.1 | the label roll starts with the transition, so the cue sits on the boundary, not 0.1 s after |
| `sfx_bubble_scheduled_out` | Scheduled: outgoing bubble | 1308 | 1308 | 21.80 | reuse sfx_msg_in, quiet | 0.25 | no new file needed |
| `sfx_bubble_scheduled_in` | Scheduled: agent reply bubble | 1326 | 1326 | 22.10 | reuse sfx_msg_in, quiet, slightly lower | 0.25 | no new file needed |
| `sfx_tap_bulk` | Tap on Approve in the Bulk scenario | 1191 | 1191 | 19.85 | soft fingertip tap, dry | 0.15 | or reuse sfx_tap |
| `sfx_hold` | "Held for review" chip in the Duplicate scenario | 1255 | 1255 | 20.92 | soft low muted tone, calm and neutral, not an alarm | 0.5 |  |
| `sfx_schedule` | Date highlight in the Scheduled scenario | 1339 | 1339 | 22.32 | soft single calendar style tick with a light glass ping | 0.4 |  |
| `sfx_pulse_1` | Scenario boundary pulse | 1044 | 1044 | 17.40 | very soft low short tick, muted, felt, no tone | 0.12 | one file reused five times is fine |
| `sfx_pulse_2` | Scenario boundary pulse | 1128 | 1128 | 18.80 | very soft low short tick, muted, felt, no tone | 0.12 | one file reused five times is fine |
| `sfx_pulse_3` | Scenario boundary pulse | 1212 | 1212 | 20.20 | very soft low short tick, muted, felt, no tone | 0.12 | one file reused five times is fine |
| `sfx_pulse_4` | Scenario boundary pulse | 1296 | 1296 | 21.60 | very soft low short tick, muted, felt, no tone | 0.12 | one file reused five times is fine |
| `sfx_pulse_5` | Scenario boundary pulse | 1380 | 1380 | 23.00 | very soft low short tick, muted, felt, no tone | 0.12 | one file reused five times is fine |
| `sfx_phone_out` | Phone fades out and settles back (23.00 to 23.60 s) | 1380 | 1380 | 23.00 | a soft full airy swell that falls away to near silence, like a breath let out, glassy, no bass | 0.6 | replaces sfx_squircle and sfx_white: the circle ending was removed |
| `sfx_logo` | Logo blurs in (24.35 to 24.95 s) | 1461 | 1461 | 24.35 | one soft felt piano note with a short airy shimmer and a long natural tail | 2.5 | must decay to silence by 27.15 s |

## Music

Cinematic and minimal: felt piano, warm low pad, subtle electronic texture, D major, starting on suspended and open chords. No drums, guitar, ukulele or claps. Generate four sections; they are aligned to the picture with cuts and 300 ms crossfades in the mix.

| File | Video time | Covers | Prompt | Generate |
|---|---|---|---|---|
| `music_A` | 0.00 to 4.15 s | Intro headline until the glass resolves into the Chats list | very sparse felt piano, single soft notes with long space, quiet warm low pad rising slowly, open suspended feel, cinematic minimal, no drums, 5 seconds | 5 s (trim to 4.15 s) |
| `music_B` | 4.15 to 13.15 s | Chats list, invoice, reading, checks, Approve tap | gentle felt piano motif repeating softly, warm pad, faint electronic texture, slow building tension and curiosity, no drums, ends on an unresolved suspended chord that holds, 9 seconds | 9 s |
| `music_C` | 13.15 to 23.00 s | Payment journey, return to chat, four scenarios | begins on a held suspended chord and rises with soft arpeggiated piano, at about 2.5 seconds it resolves into a warm clear D major chord with a gentle lift, then settles into a calm confident bed with light electronic shimmer, no drums, 10 seconds | 10 s (resolve must land at 15.70 s in the video) |
| `music_D` | 23.00 to 27.35 s | Phone fades out, white, logo | a soft swell that falls away to near silence at 0.6 seconds, then after a short pause one soft felt piano chord with a long natural decay to silence, 5 seconds | 5 s (trim to 4.35 s) |

## After the files are in place

Tell Claude the files are ready. The next steps are: place each cue in Remotion within 2 frames of its motion, mix (voice reference at about -6 dBFS peak, music about 14 dB under with 4 dB ducking, effects 8 to 14 dB under), master to about -14 LUFS with a -1 dBTP true peak, render `payments-usecase-with-audio.mp4` without `--muted`, and export `payments-audio-mix.wav`, a voice only stem and a music plus effects stem. The silent render is kept.

Totals: 10 voice takes, 61 sound effect rows that need a file (fewer if you reuse the repeated ticks), 4 music sections.
