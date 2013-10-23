$cd "H:\dota2resources\heros\tiny_02\smd"
$modelname "heroes/tiny_02/tiny_02.mdl"
$model "default" "tiny_02_model.dmx.smd"

$lod 1
 {
  replacemodel "tiny_02_model.dmx" "lod1_tiny_02_model.dmx"
}
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/tiny_02/tiny_02_color.vmt" }
	{ "models/items/tiny_02/tiny_02_glacial_color.vmt" }
	{ "models/items/tiny_02/cave_tiny_02.vmt" }
}
$hboxset "default"
$hbox 0 "elbow_R" -48.393  -11.701  -16.612  11.763  13.198  9.771
$hbox 0 "bicep_R" -34.265  -5.840  -15.306  20.128  12.427  10.329
$hbox 0 "elbow_L" -7.720  -8.517  -9.315  32.734  8.506  11.241
$hbox 0 "bicep_L" 3.436  -10.111  -9.925  30.293  8.739  10.647
$hbox 0 "spine2" -0.237  -31.631  -32.283  41.325  32.967  15.039
$hbox 0 "spine1" -1.470  -23.935  -25.563  14.568  24.812  16.683
$hbox 0 "knee_R" -21.827  -10.597  -6.785  1.057  6.572  8.821
$hbox 0 "thigh_R" -31.448  -6.500  -11.385  6.796  8.068  10.347
$hbox 0 "knee_L" -3.793  -7.742  -13.010  15.537  7.270  10.513
$hbox 0 "thigh_L" -6.695  -9.109  -7.478  27.626  7.731  11.630
$hbox 0 "root" -6.049  -22.458  -18.151  24.668  25.382  9.231
$hboxset "hands"
$hbox 0 "elbow_R" -63.737  -14.127  -20.057  -53.049  15.934  11.797
$hbox 0 "wrist_L" -0.610  -7.712  -8.298  25.863  8.773  9.817
$hboxset "head"
$hbox 0 "head" -7.854  -17.356  -16.516  20.354  11.894  14.198
$hboxset "feet"
$hbox 0 "ankle_R" -15.875  -6.527  -3.923  6.316  7.025  6.247
$hbox 0 "knee_L" 17.233  -9.512  -12.668  26.596  8.931  10.237
$hboxset "select_low"
$hbox 0 "char_origin" -70.966  -17.185  -51.985  72.603  130.525  63.772
$hboxset "select_high"
$hbox 0 "char_origin" -33.305  -1.595  -32.101  37.522  66.986  37.940
$hbox 0 "char_origin" -29.526  61.809  -21.167  36.311  128.028  34.621
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate -0.00 -0.00 -0.00
$attachment "attach_bird" "bird_nest0_0" 0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$attachment "attach_eye_r" "head" 16.00 5.00 3.00 rotate 0.00 0.00 -0.00
$attachment "attach_eye_l" "head" 16.00 -12.50 3.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate -0.00 -0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 5.893 -6.910 78.076
$sequence BindPose "BindPose" fps 30.00
$sequence tiny_02_run "tiny_02_run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 6 "Hero_Tiny.Footsteps1" }
  { event AE_CL_PLAYSOUND 17 "Hero_Tiny.Footsteps1" }
}

$sequence tiny_02_idle "tiny_02_idle" loop ACT_DOTA_IDLE 3 fps 24.00
$sequence tiny_02_idle_alt "tiny_02_idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 24.00
$sequence tiny_02_attack1 "tiny_02_attack1" ACT_DOTA_ATTACK 1 fps 24.00
$sequence tiny_02_attack_alt "tiny_02_attack_alt" ACT_DOTA_ATTACK 1 fps 24.00
$sequence tiny_02_death "tiny_02_death" ACT_DOTA_DIE 1 fps 24.00
$sequence tiny_02_avalanche "tiny_02_avalanche" ACT_TINY_AVALANCHE 1 fps 24.00
$sequence tiny_02_toss "tiny_02_toss" ACT_TINY_TOSS 1 fps 24.00
$sequence tiny_02_growl "tiny_02_growl" ACT_TINY_GROWL 1 fps 24.00
$sequence tiny_2_flail "tiny_2_flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_2_stun "tiny_2_stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_02_capture "tiny_02_capture" loop ACT_DOTA_CAPTURE 1 fps 24.00
$sequence tiny_02_attack_tree "tiny_02_attack_tree" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_02_idle_tree "tiny_02_idle_tree" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tiny_02_death_tree "tiny_02_death_tree" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_02_run_tree "tiny_02_run_tree" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Tiny.Footsteps1" }
  { event AE_CL_PLAYSOUND 13 "Hero_Tiny.Footsteps1" }
}

$sequence tiny_2_flail_tree "tiny_2_flail_tree" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_2_stun_tree "tiny_2_stun_tree" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_02_growl_tree "tiny_02_growl_tree" ACT_TINY_GROWL 1 fps 24.00
$sequence tiny_02_idle_alt_tree "tiny_02_idle_alt_tree" loop ACT_DOTA_IDLE_RARE 1 fps 24.00
$sequence tiny_02_avalanche_alt_tree "tiny_02_avalanche_alt_tree" ACT_TINY_AVALANCHE 1 fps 24.00
$sequence tiny_02_toss_tree "tiny_02_toss_tree" ACT_TINY_TOSS 1 fps 24.00
