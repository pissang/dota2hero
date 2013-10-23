$cd "H:\dota2resources\heros\siren\smd"
$modelname "heroes/siren/siren.mdl"
$model "default" "siren_model.dmx.smd"

$lod 1
 {
  replacemodel "siren_model.dmx" "lod1_siren_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "wrist_R" -18.023  -7.328  -5.309  0.589  4.358  7.364
$hbox 0 "elbow_R" -26.091  -6.163  -6.669  -1.329  10.130  7.162
$hbox 0 "bicep_R" -25.571  -11.591  -9.434  -0.023  7.326  8.338
$hbox 0 "wrist_L" -0.589  -4.358  -7.364  18.023  7.328  5.309
$hbox 0 "elbow_L" 1.329  -10.130  -7.162  26.091  6.163  6.669
$hbox 0 "bicep_L" 0.023  -7.326  -9.429  25.571  16.246  9.448
$hbox 0 "head" -11.274  -21.268  -4.394  15.559  22.616  30.456
$hbox 0 "spine2" -3.573  -10.508  -11.123  13.805  11.857  13.564
$hbox 0 "spine1" -0.058  -13.902  -11.074  9.343  15.222  12.078
$hbox 0 "tail_R3C0" -92.990  -23.466  -37.950  61.859  32.591  30.715
$hbox 0 "root" -19.490  -16.272  -15.588  14.973  17.381  1.576
$hboxset "hands"
$hbox 0 "wrist_R" -18.023  -7.328  -5.309  0.589  4.358  7.364
$hbox 0 "wrist_L" -0.589  -4.358  -7.364  18.023  7.328  5.309
$hboxset "head"
$hbox 0 "head" -11.274  -21.268  -4.394  15.559  22.616  30.456
$hboxset "feet"
$hbox 0 "tail_R3C0" -92.990  -23.466  -37.950  61.859  32.591  30.715
$hboxset "select_high"
$hbox 0 "root" -20.071  -30.051  -111.863  46.501  31.161  41.018
$hboxset "select_low"
$hbox 0 "root" -70.518  -75.704  -108.799  99.680  76.814  65.028
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "attach_lamp" "headBulb_R2C0" -2.50 -0.50 0.80 rotate -0.00 0.00 0.00
$attachment "attach_mouth" "head" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_hitloc" "spine1" 0.00 0.00 0.00 rotate -0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -64.490 0.000 84.039
$sequence BindPose "BindPose" fps 30.00
$sequence siren_idle "siren_idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence siren_idle_headTurn "siren_idle_headTurn" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence siren_idle_injured "siren_idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence siren_run "siren_run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 0 "Hero_NageSiren.Movement" }
  { event AE_CL_PLAYSOUND 25 "Hero_NagaSiren.Movement" }
}

$sequence siren_run_injured "siren_run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 0 "Hero_NageSiren.Movement" }
  { event AE_CL_PLAYSOUND 25 "Hero_NagaSiren.Movement" }
}

$sequence siren_run_haste "siren_run_haste" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 0 "Hero_NageSiren.Movement" }
  { event AE_CL_PLAYSOUND 25 "Hero_NagaSiren.Movement" }
}

$sequence siren_portrait "siren_portrait" loop ACT_DOTA_CAPTURE 10 fps 30.00
$sequence siren_portrait_headTurn "siren_portrait_headTurn" ACT_DOTA_CAPTURE 1 fps 30.00
$sequence siren_death "siren_death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 18 "BodyImpact_Common.Light" }
}

$sequence siren_death2 "siren_death2" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 19 "BodyImpact_Common.Light" }
}

$sequence siren_attack "siren_attack" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_attack_injured "siren_attack_injured" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_attack2 "siren_attack2" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_attack2_injured "siren_attack2_injured" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_attack3 "siren_attack3" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_attack3_injured "siren_attack3_injured" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 11 "NAGA_SIREN_WEAPON_BLUR_A follow_origin" }
}

$sequence siren_cast1_mirrorImage "siren_cast1_mirrorImage" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence siren_cast1_mirrorImage_injured "siren_cast1_mirrorImage_injured" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence siren_cast2_ensnare "siren_cast2_ensnare" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence siren_cast2_ensnare_injured "siren_cast2_ensnare_injured" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence siren_cast3_ripTide "siren_cast3_ripTide" ACT_DOTA_CAST_ABILITY_3 1 fps 35.00
$sequence siren_cast3_ripTide_alt "siren_cast3_ripTide_alt" ACT_DOTA_CAST_ABILITY_3 1 fps 35.00
$sequence siren_cast3_ripTide_alt_injured "siren_cast3_ripTide_alt_injured" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence siren_cast3_ripTide_injured "siren_cast3_ripTide_injured" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence siren_cast4_sirenSong "siren_cast4_sirenSong" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence siren_cast4_sirenSong_injured "siren_cast4_sirenSong_injured" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence siren_cast4_cancel_sirenSong "siren_cast4_cancel_sirenSong" ACT_DOTA_CANCEL_SIREN_SONG 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_NagaSiren.SongOfTheSiren.Cancel" }
}

$sequence siren_cast4_cancel_sirenSong_injured "siren_cast4_cancel_sirenSong_injured" ACT_DOTA_CANCEL_SIREN_SONG 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_NagaSiren.SongOfTheSiren.Cancel" }
}

$sequence siren_stun "siren_stun" loop ACT_DOTA_DISABLED 1 fps 40.00
$sequence siren_flail "siren_flail" loop ACT_DOTA_FLAIL 1 fps 40.00
$sequence siren_spawn "siren_spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence siren_victory "siren_victory" loop ACT_DOTA_VICTORY 1 fps 30.00
$sequence siren_defeat "siren_defeat" loop ACT_DOTA_DEFEAT 1 fps 30.00
$sequence siren_teleport "siren_teleport" ACT_DOTA_TELEPORT 1 fps 27.00
$sequence siren_teleport_end "siren_teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00
$sequence siren_turns_lookFrame_0 "siren_turns_lookFrame_0" fps 30.00
$sequence siren_turns_lookFrame_1 "siren_turns_lookFrame_1" fps 30.00
$sequence siren_turns_lookFrame_2 "siren_turns_lookFrame_2" fps 30.00
$sequence siren_turns_dupe1_lookFrame_0 "siren_turns_dupe1_lookFrame_0" fps 30.00
$sequence siren_turns_dupe1_lookFrame_1 "siren_turns_dupe1_lookFrame_1" fps 30.00
$sequence siren_turns_dupe1_lookFrame_2 "siren_turns_dupe1_lookFrame_2" fps 30.00
$sequence siren_turns_dupe2_lookFrame_0 "siren_turns_dupe2_lookFrame_0" fps 30.00
$sequence siren_turns_dupe2_lookFrame_1 "siren_turns_dupe2_lookFrame_1" fps 30.00
$sequence siren_turns_dupe2_lookFrame_2 "siren_turns_dupe2_lookFrame_2" fps 30.00
$sequence siren_turns "siren_turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 siren_turns_lookFrame_0 siren_turns_lookFrame_1 siren_turns_lookFrame_2
}
$sequence siren_turns_dupe1 "siren_turns_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 siren_turns_dupe1_lookFrame_0 siren_turns_dupe1_lookFrame_1 siren_turns_dupe1_lookFrame_2
}
$sequence siren_turns_dupe2 "siren_turns_dupe2_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 siren_turns_dupe2_lookFrame_0 siren_turns_dupe2_lookFrame_1 siren_turns_dupe2_lookFrame_2
}
