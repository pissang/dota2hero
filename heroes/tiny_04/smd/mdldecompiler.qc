$cd "H:\dota2resources\heros\tiny_04\smd"
$modelname "heroes/tiny_04/tiny_04.mdl"
$model "default" "tiny_04_model.dmx.smd"

$lod 1
 {
  replacemodel "tiny_04_model.dmx" "lod1_tiny_04_model.dmx"
}
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/tiny_04/tiny_04_color.vmt" }
	{ "models/items/tiny_04/tiny_04_glacial_color.vmt" }
	{ "models/items/tiny_04/cave_tiny_04.vmt" }
}
$hboxset "default"
$hbox 0 "elbow_R" -114.665  -13.831  -20.934  -4.477  30.002  19.247
$hbox 0 "bicep_R" -73.269  -17.856  -15.864  -12.327  6.694  11.442
$hbox 0 "clavicle_R" -15.039  -19.267  -38.527  27.463  19.799  4.362
$hbox 0 "wrist_L" -6.268  -10.905  -21.001  25.249  15.695  12.855
$hbox 0 "elbow_L" -16.937  -18.916  -18.206  59.461  10.896  16.344
$hbox 0 "bicep_L" -9.029  -23.946  -20.531  48.515  7.654  15.790
$hbox 0 "clavicle_L" 4.353  7.611  8.912  37.928  25.251  19.369
$hbox 0 "head" -17.791  -18.669  -13.288  30.884  20.350  31.553
$hbox 0 "neck1" -8.798  -35.012  -28.723  23.652  31.341  34.218
$hbox 0 "spine3" -23.887  -60.763  -29.656  62.536  53.729  55.576
$hbox 0 "spine2" -13.476  -61.843  -57.673  55.033  47.546  33.391
$hbox 0 "spine1" -19.563  -37.493  -30.366  12.948  20.442  16.620
$hbox 0 "ankle_R" -25.809  -15.196  -8.071  15.206  13.739  16.751
$hbox 0 "knee_R" -31.438  -17.470  -14.514  5.086  12.333  19.229
$hbox 0 "thigh_R" -46.918  -15.299  -21.122  3.227  16.562  18.418
$hbox 0 "knee_L" -5.717  -18.409  -26.549  42.770  30.962  22.054
$hbox 0 "thigh_L" -7.219  -16.152  -18.578  51.011  29.266  20.015
$hbox 0 "root" -33.182  -24.451  -16.205  28.100  31.932  25.706
$hboxset "hands"
$hbox 0 "elbow_R" -114.665  -15.384  -20.934  -4.477  28.449  19.247
$hbox 0 "wrist_L" -6.268  -8.783  -21.001  25.249  17.817  12.855
$hboxset "head"
$hbox 0 "head" -17.791  -18.669  -13.288  30.884  20.350  31.553
$hboxset "select_high"
$hbox 0 "spine2" -23.312  -68.279  -48.842  79.024  54.965  26.970
$hbox 0 "root" -38.576  -45.704  -70.962  33.494  43.279  22.122
$hboxset "feet"
$hbox 0 "ankle_R" -25.809  -15.196  -8.071  15.206  13.739  16.751
$hbox 0 "knee_L" -5.717  -18.409  -26.549  42.770  30.962  22.054
$hboxset "select_low"
$hbox 0 "root" -50.410  -77.445  -70.730  102.624  84.926  145.965
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 -0.00 rotate -0.00 -0.00 0.00
$attachment "attach_eye_r" "head" 18.50 -10.00 11.00 rotate 0.00 -0.00 0.00
$attachment "attach_eye_l" "head" 18.50 10.00 11.00 rotate 0.00 -0.00 0.00
$attachment "attach_portrait" "head" 0.00 -0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_bird" "spine3" 50.00 35.00 30.00 rotate -0.00 0.00 0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 8.873 -12.268 119.379
$sequence BindPose "BindPose" fps 30.00
$sequence tiny_04_run "tiny_04_run" loop ACT_DOTA_RUN 1 fps 25.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_Tiny.Footsteps3" }
  { event AE_CL_PLAYSOUND 14 "Hero_Tiny.Footsteps3" }
}

$sequence tiny_04_idle "tiny_04_idle" loop ACT_DOTA_IDLE 3 fps 30.00
$sequence tiny_04_idle_alt "tiny_04_idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence tiny_04_attack1 "tiny_04_attack1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_04_attack_alt "tiny_04_attack_alt" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_04_death "tiny_04_death" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_04_avalanche "tiny_04_avalanche" ACT_DOTA_CAST_ABILITY_1 1 fps 24.00
$sequence tiny_04_toss "tiny_04_toss" ACT_TINY_TOSS 1 fps 24.00
$sequence tiny_04_stun "tiny_04_stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_4_flail "tiny_4_flail" ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_04_grow "tiny_04_grow" ACT_TINY_GROWL 1 fps 26.00
$sequence tiny_04_capture "tiny_04_capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence tiny_04_attack1_tree "tiny_04_attack1_tree" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_04_death_tree "tiny_04_death_tree" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_04_run_tree "tiny_04_run_tree" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 2 "Hero_Tiny.Footsteps3" }
  { event AE_CL_PLAYSOUND 19 "Hero_Tiny.Footsteps3" }
}

$sequence tiny_04_stun_tree "tiny_04_stun_tree" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_4_flail_tree "tiny_4_flail_tree" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_04_idle_tree "tiny_04_idle_tree" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tiny_04_idle_alt_tree "tiny_04_idle_alt_tree" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence tiny_04_toss_tree "tiny_04_toss_tree" ACT_TINY_TOSS 1 fps 24.00
$sequence tiny_04_grow_tree "tiny_04_grow_tree" ACT_TINY_GROWL 1 fps 26.00
$sequence tiny_04_avalanche_alt_tree "tiny_04_avalanche_alt_tree" ACT_DOTA_CAST_ABILITY_1 1 fps 24.00
