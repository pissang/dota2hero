$cd "H:\dota2resources\heros\shredder\smd"
$modelname "heroes/shredder/shredder.mdl"
$model "default" "shredder_model.dmx.smd"

$lod 1
 {
  replacemodel "shredder_model.dmx" "lod1_shredder_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "kneeCapR11_0" -14.333  -13.259  -12.044  -0.000  13.259  13.259
$hbox 0 "knee_R" -31.165  -10.219  -8.373  7.496  11.286  7.729
$hbox 0 "thigh_R" -25.002  -12.562  -9.125  9.502  12.402  9.670
$hbox 0 "shoulerpadR0_0" -8.837  -3.533  -31.379  16.388  35.139  32.887
$hbox 0 "shoulerpadL0_0" -16.388  -3.533  -31.379  8.837  35.139  32.887
$hbox 0 "elbow_A_R" -35.621  -23.530  -16.752  25.774  16.876  16.153
$hbox 0 "bicep_A_R" -55.767  -14.955  -13.855  13.968  15.557  16.075
$hbox 0 "elbow_L" -2.114  -8.432  -6.386  22.726  5.422  8.803
$hbox 0 "bicep_L" -1.866  -5.234  -4.526  11.565  2.789  5.980
$hbox 0 "spine1_2" -6.573  -20.742  -22.935  35.152  20.742  11.373
$hbox 0 "elbow_R" -22.726  -5.422  -8.803  2.114  8.432  6.386
$hbox 0 "bicep_R" -11.565  -2.789  -5.980  1.866  5.234  4.526
$hbox 0 "spine1_1" -1.731  -10.458  -10.386  25.522  10.458  9.751
$hbox 0 "Chimmney3" -10.856  -23.109  -2.421  11.890  0.000  8.529
$hbox 0 "Chimmney2" -2.166  -14.891  -9.504  28.588  11.365  19.152
$hbox 0 "Chimmney1" -5.671  -8.290  -10.281  32.269  6.111  8.997
$hbox 0 "RipSawBase9_0" -6.116  -9.557  -11.795  42.238  9.099  8.563
$hbox 0 "elbow_A_L" -25.774  -16.876  -16.153  35.621  23.530  16.752
$hbox 0 "bicep_A_L" -13.968  -15.557  -16.075  55.767  14.955  13.855
$hbox 0 "controFR2_0" -1.871  -3.136  -6.518  5.883  13.162  40.658
$hbox 0 "ControlBR6_0" -1.410  -4.395  -2.765  9.187  4.395  45.779
$hbox 0 "controFL1_0" -2.150  -13.077  -6.509  7.630  3.221  40.488
$hbox 0 "ControlBL7_0" -1.410  -4.395  -2.765  9.187  4.395  45.779
$hbox 0 "spine1" -40.377  -57.637  -55.561  49.016  57.637  48.079
$hbox 0 "kneeCapL10_0" -14.333  -13.259  -12.044  -0.000  13.259  13.259
$hbox 0 "knee_L" -7.496  -11.286  -7.729  31.165  10.219  8.373
$hbox 0 "thigh_L" -9.502  -12.402  -9.670  25.002  12.562  9.125
$hbox 0 "root" -53.079  -53.079  -26.267  53.079  53.079  21.417
$hboxset "feet"
$hbox 0 "ankle_R" -22.326  -23.936  -40.283  14.015  23.584  11.529
$hbox 0 "ankle_L" -14.015  -23.584  -11.529  22.326  23.936  40.283
$hboxset "hands"
$hbox 0 "wrist_L" -0.142  -4.247  -5.105  12.567  4.118  6.056
$hbox 0 "wrist_R" -12.567  -4.118  -6.056  0.142  4.247  5.105
$hboxset "select_low"
$hbox 0 "root" -88.517  -93.392  -84.830  88.517  93.392  73.301
$hboxset "select_high"
$hbox 0 "root" -47.300  -47.674  -84.754  39.204  47.674  54.393
$attachment "attach_armor" "shield" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_attack1" "Claw" 0.00 0.00 0.00 rotate -0.00 -0.00 -0.00
$attachment "attach_chimmney" "ChimneyFX" 0.00 0.00 -0.00 rotate -0.00 0.00 -0.00
$attachment "attach_attack2" "RipSawBase9_0" -0.00 0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "attach_saw" "RipSaw" 0.00 -0.00 -0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "root" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -0.000 -0.000 89.242
$sequence BindPose "BindPose" fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 25.00 {
  { event AE_CL_PLAYSOUND 13 "Hero_Shredder.Footsteps_spawn" }
  { event AE_CL_PLAYSOUND 14 "Hero_Shredder.Footsteps_spawn" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_rare1 "idle_rare1" ACT_DOTA_IDLE_RARE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 15 "Hero_Shredder.Dance" }
}

$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 0 "Hero_Shredder.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_Shredder.Footsteps" }
}

$sequence death "death" ACT_DOTA_DIE 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Shredder.Death_a" }
  { event AE_CL_PLAYSOUND 17 "Hero_Shredder.Death_b" }
  { event AE_CL_PLAYSOUND 47 "Hero_Shredder.Death_c" }
}

$sequence Attack_1 "Attack_1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence Attack_2 "Attack_2" ACT_DOTA_ATTACK 1 fps 30.00
$sequence Attack_3 "Attack_3" ACT_DOTA_ATTACK 1 fps 30.00
$sequence Attack_4 "Attack_4" ACT_DOTA_ATTACK 1 fps 30.00
$sequence injured "injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Shredder.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_Shredder.Footsteps" }
}

$sequence injured_attack "injured_attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence injured_idle "injured_idle" ACT_DOTA_IDLE 1 fps 30.00
$sequence stun "stun" ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence whirlingDeath "whirlingDeath" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence timberChain "timberChain" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 9 "Hero_Shredder.Footsteps" }
}

$sequence chakram "chakram" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 25.00
$sequence idle_chakram "idle_chakram" ACT_DOTA_IDLE 1 fps 30.00
$sequence run_chakram "run_chakram" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Shredder.Footsteps" }
  { event AE_CL_PLAYSOUND 12 "Hero_Shredder.Footsteps" }
  { event AE_CL_PLAYSOUND 24 "Hero_Shredder.Footsteps" }
  { event AE_CL_PLAYSOUND 36 "Hero_Shredder.Footsteps" }
}

$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence bladesSpin "bladesSpin" loop ACT_DOTA_CONSTANT_LAYER 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
