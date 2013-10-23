$cd "H:\dota2resources\heros\skeleton_king\smd"
$modelname "heroes/skeleton_king/skeleton_king.mdl"
$model "default" "skeleton_king_model.dmx.smd"

$lod 1
 {
  replacemodel "skeleton_king_model.dmx" "lod1_skeleton_king_model.dmx"
}
$cdmaterials ""
$hboxset "default"
$hbox 0 "knee_R" -45.626  -9.005  -19.489  0.519  6.260  8.989
$hbox 0 "thigh_R" -54.827  -10.148  -15.205  1.509  13.045  5.560
$hbox 0 "knee_L" -2.420  -6.260  -8.989  37.608  9.005  19.489
$hbox 0 "thigh_L" -1.509  -13.045  -5.560  54.827  10.148  15.205
$hbox 0 "wrist_L" 1.609  -0.232  -13.356  32.570  20.278  13.432
$hbox 0 "elbow_L" -0.881  -5.134  -8.734  46.888  7.118  8.311
$hbox 0 "bicep_L" -4.835  -7.030  -4.954  47.069  8.237  7.696
$hbox 0 "Head_1" -7.208  -12.251  -13.199  18.327  12.251  10.976
$hbox 0 "wrist_R" -29.580  -13.936  -21.849  4.556  4.288  9.540
$hbox 0 "elbow_R" -42.628  -11.744  -13.070  -6.972  13.207  12.028
$hbox 0 "bicep_R" -50.006  -9.552  -12.313  4.832  9.147  9.449
$hbox 0 "Spine_2" -27.249  -31.400  -27.735  23.399  34.326  21.756
$hbox 0 "Root_0" -21.741  -25.811  -18.757  17.180  26.350  16.148
$hboxset "feet"
$hbox 0 "ankle_R" -36.333  -6.803  -2.205  3.127  9.523  9.875
$hbox 0 "ankle_L" -3.127  -9.401  -8.511  36.333  7.439  6.170
$hboxset "hands"
$hbox 0 "wrist_L" 1.609  -0.232  -13.356  32.570  20.278  13.432
$hbox 0 "wrist_R" -29.580  -13.936  -21.849  4.556  4.288  9.540
$hboxset "head"
$hbox 0 "Head_1" -7.208  -12.251  -13.199  18.327  12.251  10.976
$hboxset "weapon"
$hbox 0 "weapon0_0" -37.616  -33.833  -7.127  173.606  30.682  7.071
$hboxset "select_low"
$hbox 0 "Root_0" -64.985  -82.925  -100.837  71.063  83.464  64.835
$hboxset "select_high"
$hbox 0 "Root_0" -23.589  -33.537  10.142  32.042  36.462  73.794
$hbox 0 "Root_0" -23.127  -38.212  -101.942  30.708  38.751  9.484
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate 90.00 9.30 0.00
$attachment "attach_left_eye" "Head_1" 12.50 5.00 2.00 rotate -0.00 -0.00 -0.00
$attachment "attach_right_eye" "Head_1" 12.50 -5.00 2.00 rotate -0.00 -0.00 -0.00
$attachment "attach_attack1" "weapon0_0" 90.00 0.00 0.00 rotate 90.00 0.00 0.00
$attachment "attach_hitloc" "Spine_1" 0.00 0.00 0.00 rotate 90.00 -0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 56.936 -7.878 88.637
$sequence BindPose "BindPose" fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR start_at_origin" }
}

$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR_REVERSE start_at_origin" }
}

$sequence death "death" ACT_DOTA_DIE 1 fps 30.00
$sequence hellfire "hellfire" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 10 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 9 "Hero_SkeletonKing.Footsteps" }
  { event AE_CL_PLAYSOUND 21 "Hero_SkeletonKing.Footsteps" }
}

$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00
$sequence run_chase "run_chase" loop ACT_DOTA_RUN 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence crit "crit" ACT_DOTA_ATTACK_EVENT 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR_CRITICAL start_at_origin" }
}

$sequence idle_alt "idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence death_sim "death_sim" fps 24.00
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
$sequence attack_regalia_bonelord "attack_regalia_bonelord" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR start_at_origin" }
}

$sequence attack2_regalia_bonelord "attack2_regalia_bonelord" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR start_at_origin" }
}

$sequence attack3_regalia_bonelord "attack3_regalia_bonelord" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 14 "SKELETON_KING_WEAPON_BLUR start_at_origin" }
}

