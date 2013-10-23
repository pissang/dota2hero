$cd "H:\dota2resources\heros\spectre\smd"
$modelname "heroes/spectre/spectre.mdl"
$model "default" "spectre_base_model.dmx.smd"

$lod 1
 {
  replacemodel "spectre_base_model.dmx" "lod1_spectre_base_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "wrist_L" -2.197  -7.223  -7.569  34.436  13.495  10.411
$hbox 0 "elbow_L" -17.379  -14.489  -9.338  26.636  4.103  6.939
$hbox 0 "bicep_L" 7.210  -7.373  -8.924  36.258  5.518  6.060
$hbox 0 "shoulderPad1_0_R" -14.617  -0.281  -3.486  2.811  43.423  74.884
$hbox 0 "shoulderPad4_0_B_L" -14.617  -43.423  -3.486  2.811  0.281  74.884
$hbox 0 "shoulderPad6_0_C_L" -12.155  -1.417  -4.801  36.372  73.096  44.981
$hbox 0 "shoulderPad7_0_C_R" -12.155  -73.096  -4.801  36.372  1.417  44.981
$hbox 0 "head" -91.022  -14.282  -14.812  11.260  14.282  41.098
$hbox 0 "wrist_R" -34.436  -13.495  -10.411  2.203  7.223  7.569
$hbox 0 "elbow_R" -27.163  -5.005  -6.999  8.204  14.334  9.993
$hbox 0 "bicep_R" -36.273  -6.743  -5.992  -7.217  13.395  8.058
$hbox 0 "shoulderPad2_0_A_L" -6.452  -43.550  -9.149  50.974  -1.462  28.489
$hbox 0 "shoulderPad3_0_A_R" -6.452  1.462  -9.149  50.974  43.550  28.489
$hbox 0 "cape0_1_L" -13.685  -10.724  -64.138  21.659  30.816  -3.391
$hbox 0 "cape0_0_L" -2.793  -14.056  -4.697  42.018  10.900  12.766
$hbox 0 "cape5_1_B_R" -21.659  -10.724  -64.138  13.685  30.816  -3.391
$hbox 0 "cape5_0_B_R" -40.708  -13.619  -4.697  2.793  10.900  12.766
$hbox 0 "spine5_0" -10.549  -9.236  -1.240  7.164  9.236  49.020
$hbox 0 "spine2" -28.678  -33.818  -25.464  43.858  33.818  70.902
$hbox 0 "spine1" -1.672  -14.789  -19.666  20.891  14.790  15.534
$hbox 0 "skirtBackR3_0" -0.480  -42.729  -25.218  22.248  0.157  -1.049
$hbox 0 "skirtBackL4_0" -12.829  3.337  -39.071  10.185  37.736  -0.920
$hbox 0 "backSkirt1_0" -32.749  -29.416  -57.349  3.861  29.416  -9.966
$hbox 0 "skirtR8_1_D_L" -3.878  -23.217  -38.505  25.603  30.033  25.417
$hbox 0 "skirtR8_0_D_L" 3.305  3.730  -24.508  45.753  16.971  14.115
$hbox 0 "skirtL9_1_D_R" -25.603  -23.217  -38.505  3.878  30.033  25.417
$hbox 0 "skirtL9_0_D_R" -45.753  3.730  -24.508  -3.305  16.971  14.115
$hbox 0 "skirtF2_1" 5.992  -26.715  17.000  42.989  26.715  25.538
$hbox 0 "skirtF2_0" -8.934  -14.657  -3.048  42.144  14.657  12.207
$hbox 0 "root" -41.848  -25.220  -30.457  12.432  25.220  35.955
$hboxset "select_high"
$hbox 0 "root" -37.828  -30.136  17.804  20.546  30.136  78.760
$hbox 0 "root" -42.118  -34.259  -118.734  25.637  34.259  17.637
$hboxset "select_low"
$hbox 0 "root" -98.967  -84.778  -133.705  77.157  84.778  62.541
$hboxset "hands"
$hbox 0 "wrist_L" -2.197  -7.223  -7.569  34.436  13.495  10.411
$hbox 0 "wrist_R" -34.436  -13.495  -10.411  2.203  7.223  7.569
$hboxset "head"
$hbox 0 "head" -91.022  -14.282  -14.812  11.260  14.282  41.098
$attachment "attach_attack1" "ring0_1" -0.00 -0.00 0.00 rotate 0.00 90.00 0.00
$attachment "attach_hitloc" "spine2" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -14.841 0.000 120.078
$sequence BindPose "BindPose" fps 30.00
$sequence spawn_temp "spawn_temp" ACT_DOTA_SPAWN 9 fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 9 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00
$sequence attack1 "attack1" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "SPECTRE_ATTACK_BLUR start_at_origin" }
}

$sequence attack "attack" ACT_DOTA_ATTACK 4 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 6 "SPECTRE_ATTACK_BLUR start_at_origin" }
}

$sequence disabled "disabled" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence cast_dagger "cast_dagger" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence cast_haunt "cast_haunt" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence die "die" ACT_DOTA_DIE 1 fps 30.00
$sequence capture "capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence turns "turns" fps 30.00
$sequence workshop_anim_00 "workshop_anim_00" fps 30.00
$sequence workshop_anim_01 "workshop_anim_01" fps 30.00
$sequence workshop_anim_02 "workshop_anim_02" fps 30.00
$sequence workshop_anim_03 "workshop_anim_03" fps 30.00
$sequence workshop_anim_04 "workshop_anim_04" fps 30.00
$sequence workshop_anim_05 "workshop_anim_05" fps 30.00
$sequence workshop_anim_06 "workshop_anim_06" fps 30.00
$sequence workshop_anim_07 "workshop_anim_07" fps 30.00
$sequence workshop_anim_08 "workshop_anim_08" fps 30.00
$sequence workshop_anim_09 "workshop_anim_09" fps 30.00
$sequence turns_dupe1_lookFrame_0 "turns_dupe1_lookFrame_0" fps 30.00
$sequence turns_dupe1_lookFrame_1 "turns_dupe1_lookFrame_1" fps 30.00
$sequence turns_dupe1_lookFrame_2 "turns_dupe1_lookFrame_2" fps 30.00
$sequence turns_dupe1 "turns_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_dupe1_lookFrame_0 turns_dupe1_lookFrame_1 turns_dupe1_lookFrame_2
}
