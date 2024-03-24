const app = getApp();
const mwx = require('../../utils/mwx.js');
const { colorList, getColorList } = require('../../utils/colorList.js');
const { Cache } = require('../../utils/Cache.js');
const { checkRuleList, FaceCheck } = require('../utils/faceCheck.js');

let cache = new Cache();
let apiCache = new Cache();
let searchEffectStatus;
let recordCache = {};

Page({
  data: {
    isIPX: app.globalData.isIPX,
    colorList: [],
    activeColorIndex: 0,
    cardWidth: '', // 界面中的证件宽高
    cardHeight: '',
    actualCardWidth: '', // 实际导出的证件宽高
    actualCardHeight: '',
    handlingIndex: 0,
    iconSize: 30,
    useHatList: [],
    hatPrevDataList: [],
    isReady: false,
    maxCardHeight: '',
    maxCardWidth: '',
    cardPaddingTop: 25, // .card__box上下paddingTop
    cardLeftRightMargin: 10, // .card__box距离屏幕的最小左右边距
    cardInfo: {},
    dpr: 1,
    isHandling: false,
    from: '', // changeColor or ''
    adAltShow: false,
    horizontalReferenceLineShow: false,
    verticalReferenceLineShow: false,
    activeViewTypeIndex: 0, // 0:单张 1: 排版照
    appreciationProduct: {}, // 赞赏产品信息
    cardProduct: {}, //  证件制作产品信息
    saveBoxShow: false, //
    cardOutBorderWidth: 22,
    originCardImageSrc: '',
    originSixCardImageSrc: '',
    cardImageSrc: '',
    sixCardImageSrc: '',
    activeToolIndex: 0,
    toolsList: [
      {
        text: '背景',
        feature: 'background',
        icon: '/assets/image/id_certificate_icon_background@2x.png',
        activeIcon: '/assets/image/id_certificate_icon_background_s@2x.png'
      },
      {
        text: '美颜',
        feature: 'beauty',
        icon: '/assets/image/id_certificate_icon_beautyface@2x.png',
        activeIcon: '/assets/image/id_certificate_icon_beautyface_s@2x.png'
      }
    ],
    activeBeautyIndex: 0,
    beautyList: [
      {
        text: '无',
        icon: '/assets/image/id_certificate_icon_null@2x.png',
        icon_s: '/assets/image/id_certificate_icon_null_s@2x.png'
      },
      {
        text: '一键美颜',
        icon: '/assets/image/id_certificate_icon_autoface@2x.png',
        icon_s: '/assets/image/id_certificate_icon_autoface_s@2x.png'
      }
      // {
      //   text: '美白',
      //   type: 'white',
      //   icon: '/assets/image/id_certificate_icon_skinwhitening@2x.png',
      //   value: 4
      // },
      // {
      //   text: '磨皮',
      //   type: 'smooth',
      //   icon: '/assets/image/id_certificate_icon_buffing@2x.png',
      //   value: 4
      // },
      // {
      //   text: '大眼',
      //   type: 'largeEye',
      //   icon: '/assets/image/id_certificate_icon_oxeye@2x.png',
      //   value: 4
      // },
      // {
      //   text: '瘦脸',
      //   type: 'slimFace',
      //   icon: '/assets/image/id_certificate_icon_thinface@2x.png',
      //   value: 4
      // }
    ],
    originImageShow: false,
    faceDetectComponentShow: false,
    sixCardComponentShow: false,
    cropImageComponentShow: false,
    checkRuleLoadingShow: false,
    handlingImageLoading: false,
    cardTextBoxShow: false,
    cardBottomText: '',
    beautyAnimationShow: false,
    loadingText: '检测人脸中',
    compressImageShow: false,
    printbutton_firsttext: '',
    printbutton_color: '',
    danmu: {},
    redPointShow: false,
    toolList: [
      {
        icon: '/assets/image/id_certificate_icon_suit@2x.png',
        text: '换正装',
        type: 'changeClothes'
      },
      {
        icon: '/assets/image/id_certificate_icon_background@2x.png',
        text: '换底色',
        type: 'changeColor'
      },
      {
        icon: '/assets/image/id_certificate_icon_beautyface@2x.png',
        icon_s: '/assets/image/id_certificate_icon_beautyface_s@2x.png',
        text: '一键美颜',
        type: 'beauty',
        loading__text: '美颜中...',
        cancel__text: '取消美颜'
      },
      {
        icon: '/assets/image/id_certificate_icon_light@2x.png',
        icon_s: '/assets/image/id_certificate_icon_light_s@2x.png',
        text: '智能补光',
        type: 'addLight',
        loading__text: '补光中...',
        cancel__text: '取消补光'
      },
      {
        icon: '/assets/image/id_certificate_icon_text@2x.png',
        icon_s: '/assets/image/id_certificate_icon_text_s@2x.png',
        text: '添加文字',
        type: 'addText',
        cancel__text: '移除文字'
      }
    ],
    beautyStatus: 0, // 美颜状态 0:关闭 1:处理中 2：开启
    lightStatus: 0, // 补光状态 0:关闭 1:处理中 2：开启
    highDefinitionStatus: false, // 高清化状态
    colorSelectShow: false,
    clothToolShow: false,
    openTransition: false,
    clothToolHeight: 0,
    topOffset: 0,
    faceHighDefinitionShow: false,
    addtoMiniprogramShow: false,
    originImageSrc: '',
    checkRuleList: [], // 检测规则列表
    currentCheckRuleText: ' ', // 当前真正检测项的文字
    checkAltInfo: {}, // 规则项检测提示  {status,text}
    checkRuleResultShow: false,
    isUseOriginImage: false, // 使用原图,不进行抠图
    unevaluateShow: false,
    clothTemplateList: [], // 换装模板列表
    activeClothId: '', // 换装模板id
    clothSaveBoxShow: false,
    isIos: getApp().globalData.isIos,
    failReasonText: '',
    bottomDialogShow: false,
    ___________cache: {}, // TODO
    clothAltShow: false, // 换装提示弹窗
    changeClothPreviewImageSrc: '', // 换装预览图
    clothBeautyOpen: true,
    orderCheckBoxShow: false,
    recommandClothType: false
  },
  async onLoad(query) {
    getApp().globalData.cardImageList = [];
    this.query = query;
    mwx.report('createcard_page');
    mwx.log.info(`page=createCard,query=${JSON.stringify(query)}`);
    this.originFileNameList = [];
    this.stepRecordList = [];

    if (getApp().globalData.isPc && !mwx.config.screenScale) {
      // pc端计算屏幕比例
      mwx
        .pollCheck(() => this.selectComponent('.crop-image'), 100, 500)
        .then((r) => {
          r.getScreenScale();
        });
    }

    this.isFromSelectTypeChagneBg =
      ['changeColor', 'changeClothes'].indexOf(query.from) > -1;

    this.setData({
      from: query.from,
      dpr: !this.isFromSelectTypeChagneBg
        ? 1
        : app.globalData.systemInfo.devicePixelRatio,
      printbutton_firsttext:
        getApp().globalData.setting.printbutton_firsttext || '冲印纸质版',
      printbutton_color:
        getApp().globalData.setting.printbutton_color || '#3964f9',
      checkRuleList: JSON.parse(
        JSON.stringify([
          {
            text: '图片风险检测',
            status: 'loading',
            action: 'checkImage'
          },
          {
            text: '人脸检测',
            status: 'loading',
            action: 'cardFaceDetect'
          },
          ...checkRuleList.map((v) => {
            return {
              ...v,
              status: 'loading'
            };
          }),
          {
            text: '人脸清晰度检测',
            status: 'loading',
            action: 'cardFaceScore'
          }
        ])
      )
    });
    // 换装数据
    mwx.api.cardClothTemplateV2().then((res) => {
      this.setData({
        clothTemplateList: res.list
      });
    });

    try {
      await this.initView();
      if (this.faceBlur == 0) {
        setTimeout(() => {
          // TODO 测试去除
          this.switchBeauty({ index: 1, type: 'beauty' });
        }, 300);
      }
      // 后台制作图片
      mwx.hideLoading();
    } catch (error) {
      mwx.hideLoading();
      this.handleError(error);
    }
    if (this.data.checkAltInfo.text) {
      this.checkAltTimer = setTimeout(() => {
        if (this.data.clothAltShow) {
          return;
        }
        this.setData({
          'checkAltInfo.hidden': 1
        });
      }, 5000);
    }

    if (getApp().globalData.isIos) {
      let res = await mwx.api.cardProduct();
      this.setData({
        cardProduct: res.list[0] || {}
      });
    } else {
      let resArr = await Promise.all([
        mwx.api.siteProduct(4),
        mwx.api.cardProduct()
      ]);
      this.setData({
        appreciationProduct: resArr[0].list[0] || {},
        cardProduct: resArr[1].list[0] || {}
      });
    }
    // TODO
    // this.switchView({ currentTarget: { dataset: { index: 1 } } });
    wx.onUserCaptureScreen(function () {
      mwx.report('createcard_screenshot');
    });

    this.setData({
      redPointShow: wx.getStorageSync('isRedPointShow') ? false : true
    });

    if (this.query.from == 'changeColor') {
      let toolIndex = this.data.toolList.findIndex(
        (item) => item.type == 'changeColor'
      );
      this.switchToolIndex({
        currentTarget: {
          dataset: {
            index: toolIndex
          }
        }
      });
    }
    if (this.query.from == 'changeClothes') {
      this.showClothTool();
    }

    if (!this.data.isIos) {
      mwx.api.getClothProduct(6).then((res) => {
        this.data.toolList.forEach((v, ind) => {
          if (v.type == 'changeClothes') {
            this.setData({
              [`toolList[${ind}].text`]: `换正装`
            });
          }
        });
      });
    }

    // wx.onAppHide(async () => {
    //   console.log('onAppHide');
    //   await this.createSingleCard({ type: 'origin' });
    //   this.uploadUnSaveCard();
    // });
  },
  onUnload() {
    mwx.setStorageAsync('originFileNameList', []);
    clearInterval(this.addToMyMiniProgramTimer);
    mwx.event.off('useCustomColor');
    mwx.event.off('createCard:showClothTool');
    wx.offUserCaptureScreen();
    cache.clear();
    apiCache.clear();
    this.clearCache();
    mwx.hideLoading();
    searchEffectStatus && searchEffectStatus.clear();
    searchEffectStatus = null;
    recordCache = {};
    this.clothShowTimer && clearInterval(this.clothShowTimer);
    this.paymentTimer && clearInterval(this.paymentTimer);
    // wx.offAppHide();
  },
  onHide() {
    this.isStopLaunchDanmu = true;
    if (getApp().globalData.cardFaceTaskTimer) {
      clearInterval(getApp().globalData.cardFaceTaskTimer);
    }
    if (getApp().globalData.cardFaceClothTimer) {
      clearInterval(getApp().globalData.cardFaceClothTimer);
    }
  },
  onShow() {
    this.isStopLaunchDanmu = false;
  },
  handleError(error) {
    let message = error
      ? error.cropFailReason || error.errMsg || error.message || error
      : '';
    let type = '';
    // 裁剪问题
    if (error && error.cropFailReason) {
      type = 6;
    } else {
      type = 2;
      let networkErrorList = [
        'downloadFile:fail',
        'request:fail',
        'uploadFile:fail',
        '连接超时',
        '图片安全检测超时',
        '网络连接超时,请稍后重试'
      ];
      message = message || '';

      networkErrorList.some((v) => {
        if (message.indexOf(v) > -1) {
          type = 4; // 网络错误
          message = '网络连接超时,请稍后重试';
          return true;
        } else {
          return false;
        }
      });
    }
    if (message) {
      mwx.event.emit('faceFail', { message });
    } else {
      mwx.event.emit('faceFail', { message: '图片不符合要求' });
    }
    this.goFailBack({ type });
    mwx.report('createcard_fail');
    mwx.log.error(error);
  },
  showHandingImageAnimate() {
    let { cardInfo } = this.data;
    this.setData({
      handlingImageLoading: true
    });
    let loadingComponent = this.selectComponent('.handling-img');
    loadingComponent.init({
      originImageSrc: cardInfo.imgSrc,
      limitWidth: getApp().globalData.systemInfo.windowWidth - 100,
      limitHeight: getApp().globalData.systemInfo.screenHeight * 0.7
    });
  },
  async retouchOriginImage() {
    try {
      let { cardInfo } = this.data;
      this.showHandingImageAnimate();

      let afterHandlerImage = cardInfo.imgSrc;
      this.afterHandlerImage = afterHandlerImage;
      let info = await mwx.getImageInfo(afterHandlerImage);

      this.imageInfo = info;
      this.cardScale = info.width / cardInfo.w;

      this.setData({
        loadingText: '图片风险检测中'
      });

      let { checkStatus, fileName, url } = await mwx.api.checkImage(
        afterHandlerImage,
        this,
        {
          origin: 1,
          riskyCheck: 0,
          resize: 1980,
          poi: 2001
        }
      );
      this.prevFileNameWithBg = fileName;
      this.prevImageWithBg = url;
      this.stepRecordList.push({
        fileName,
        action: '原图'
      });
      this.originFileNameList.push(fileName);

      // 5. 进行抠图
      this.afterCropFileName = fileName;
      if (checkStatus == 1) {
        this.setData({
          loadingText: '证件照生成中'
        });

        let res = await mwx.api.v5ImageSegmentUrl(fileName);
        this.stepRecordList.push({
          fileName: res.fileName,
          action: '抠图'
        });
        this.alphaFileName = res.alphaFileName || res.fileName;
        this.originFileName = res.fileName;

        this.originFileNameList.push(res.fileName);
        wx.setStorageSync('originFileNameList', this.originFileNameList);
        getApp().globalData.cardImageList.push({
          fileName: res.fileName,
          text: 'retouchOriginImage抠图'
        });
        this.setData({
          originCardImageSrc: res.url, // 未进行任何特效处理的原始透明图（点击对比展示的图）
          cardImageSrc: res.url // 直接展示的图
        });

        // 初始化状态
        searchEffectStatus = this.createSearchEffectStatus();
        searchEffectStatus.setStatus({
          type: 'origin',
          data: {
            fileName: this.originFileName,
            cardImageSrc: res.url,
            originCardImageSrc: res.url
          }
        });

        mwx.log.info('换底色:原图尺寸完成制作');
      } else {
        mwx.event.emit('faceFail', {
          message:
            checkStatus == -1
              ? '检测到有图片存在违规内容'
              : '网络连接超时,请稍后重试'
        });
        this.goFailBack({ type: checkStatus == -1 ? 3 : 4 });
        return;
      }
      this.setData({ handlingImageLoading: false });
      this.canCreateSixCard = await this.checkIfCanCreateSixCard();
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },
  async faceDetect() {
    // // TODO 测试数据
    // this.cardScale = 3.833898305084746;
    // let url = (
    //   await mwx.downloadFile(
    //     'https://img.elfinbook.com/20230607/0/4D89F23588915FD1.png'
    //   )
    // ).tempFilePath;
    // this.setData({
    //   originCardImageSrc: url,
    //   cardImageSrc: url,
    //   loadingShow: false,
    //   saveBoxShow: false
    // });
    // this.alphaFileName = '078fae64febe610760aceaf151a8edd7';
    // // this.showClothTool();
    // return;

    let { cardInfo } = this.data;
    mwx.log.info(`cardInfo=${JSON.stringify(cardInfo)}`);
    let loadingComponent;
    this.setData({
      checkRuleLoadingShow: true,
      currentCheckRuleText: '风险图片检测中，请稍等',
      originImageSrc: cardInfo.imgSrc
    });
    // 1. 人脸识别，获取人脸区域
    mwx.log.info('1.人脸识别，获取人脸区域');
    let anchors = [];
    try {
      let useLocalFace = false;
      let { checkStatus, fileName } = await mwx.service.checkImage(
        cardInfo.imgSrc,
        this,
        {
          origin: 1,
          poi: 2001
        }
      );
      this.resolveCheckTask({ action: 'checkImage' });
      this.stepRecordList.push({
        fileName,
        action: '原图'
      });
      this.originFileNameList.push(fileName);
      if (checkStatus != 1) {
        mwx.event.emit('faceFail', {
          message: '网络连接超时,请稍后重试'
        });
        this.goFailBack({ type: checkStatus == -1 ? 3 : 4 });
        return;
      }

      // 没有数据&&不是本地处理
      if (!anchors.length && !useLocalFace) {
        mwx.action.setStatisticImageUpload({ poi: 2001 });
        cardInfo.fileName = fileName;
        mwx.action.setCardInfo(cardInfo);
        try {
          let faceDetectRes = await mwx.api.cardFaceDetect({
            fileName
          });
          // throw new Error('人脸检测失败');
          anchors = faceDetectRes.list;
        } catch (error) {
          mwx.log.error(error);
          try {
            if (getApp().globalData.isSupportLocalFaceDetect !== false) {
              mwx.log.info('使用本地人脸检测');
              // 本地处理
              this.setData({
                faceDetectComponentShow: true
              });
              await mwx.pollCheck(() =>
                this.selectComponent('.photo-face-detect')
              );
              let c = this.selectComponent('.photo-face-detect');
              await mwx.util.promiseTimeout(
                c.initData(cardInfo.imgSrc).then((r) => {
                  anchors = r;
                  useLocalFace = true;
                }),
                10000
              );
              c.clear();
              this.setData({
                faceDetectComponentShow: false
              });
            } else {
              throw error;
            }
          } catch (error) {
            mwx.log.error(error);
            // throw new Error('人脸检测失败，请重试');
          }
        }
      }
      this.resolveCheckTask({ action: 'cardFaceDetect' });
      let imageInfo = await mwx.getImageInfo(cardInfo.imgSrc);
      if (anchors.length == 0) {
        mwx.event.emit('faceFail', {
          message: '图片未检测到人脸信息'
        });
        this.goFailBack({ type: 5 });
        return;
      }
      this.anchors = anchors;
      let faceCheck = new FaceCheck({
        anchors,
        imageWidth: imageInfo.width,
        imageHeight: imageInfo.height,
        rectWidth: cardInfo.w || cardInfo.width,
        rectHeight: cardInfo.h || cardInfo.height,
        head2Top: cardInfo.head2Top,
        eye2Bottom: cardInfo.eye2Bottom,
        pupil2pupil: cardInfo.pupil2pupil,
        chin2Bottom: cardInfo.chin2Bottom,
        faceHeight: cardInfo.faceHeight,
        leftAndRight: cardInfo.leftAndRight,
        mouthOpen: cardInfo.mouthOpen,
        eyeClose: cardInfo.eyeClose,
        eyebrowCover: cardInfo.eyebrowCover,
        earCover: cardInfo.earCover
      });
      this.faceCheck = faceCheck;
      checkRuleList.forEach((v) => {
        try {
          let r = faceCheck[v.action]();
          this.resolveCheckTask({
            action: v.action,
            status: r.suggest,
            msg: r.msg,
            desc: r.desc
          });
        } catch (error) {
          // TODO 正常不应该出现错误情况
          if (mwx.config.isDev) {
            mwx.Toast('出现异常，联系开发人员：' + error);
          }
          mwx.log.error(error);
          this.resolveCheckTask({
            action: v.action,
            status: 'review',
            msg: error.cropFailReason || '处理失败'
          });
        }
      });
      let checkResult = this.groupCheckRuleResult();
      if (checkResult == -1) {
        return;
      }

      // 根据检测结果处理

      let cropInfo;
      let afterHandlerImage;
      // 2. 人脸区域裁剪
      let faceAngleCrop_step2 = async ({ times = 1 } = {}) => {
        mwx.log.info('2.人脸区域裁剪');
        this.setData({
          loadingText: '获取人脸取景范围'
        });
        cropInfo = faceCheck.getAngleAndRect(times);
        this.cropInfo = cropInfo;

        this.setData({
          cropImageComponentShow: true
        });
        // 图片裁剪
        afterHandlerImage = await this.selectComponent('.crop-image').crop({
          imageSrc: cardInfo.imgSrc,
          canvasWidth: imageInfo.width,
          canvasHeight: imageInfo.height,
          cropInfo,
          originImageWidth: imageInfo.width,
          originImageHeight: imageInfo.height,
          pageSelf: this
        });

        let res3 = await mwx.api.checkImage(afterHandlerImage, this, {
          origin: 1,
          riskyCheck: 0,
          poi: 2008
        });

        checkStatus = res3.checkStatus;
        fileName = res3.fileName;
        this.prevFileNameWithBg = res3.fileName;
        this.prevImageWithBg = afterHandlerImage;
        this.stepRecordList.push({
          fileName,
          action: '裁剪后的图片'
        });
        this.originFileNameList.push(fileName);
        if (checkStatus != 1 || !fileName) {
          mwx.event.emit('faceFail', {
            message: '网络连接超时,请稍后重试'
          });
          this.goFailBack({ type: checkStatus == -1 ? 3 : 4 });
          return;
        }
      };
      if (!this.isCurrentPage()) {
        return;
      }

      await faceAngleCrop_step2();

      let checkResult2 = this.groupCheckRuleResult();
      if (checkResult2 == -1) {
        return;
      }

      // 3. 图片清晰度检测
      let scoreAndEnhance_step3 = async ({ times = 1 } = {}) => {
        this.setData({
          loadingText: '人脸清晰度检测中'
        });
        this.resolveCheckTask({
          action: 'cardFaceScore',
          status: 'loading'
        });
        if (!fileName) {
          //
          return;
        }
        let { faceBlur, score } = await mwx.api.cardFaceScore({
          fileName,
          faceRatio: (this.cropInfo.rect[2] / cardInfo.w).toFixed(2)
        });
        this.blurScore = score;
        this.faceBlur = faceBlur;
        mwx.log.info(`3.清晰度检测：faceBlur=${faceBlur}`);

        let faceEnhance = async () => {
          this.setData({
            loadingText: '人脸高清处理中'
          });
          this.showHandingImageAnimate();

          // 更新修改模糊项检测结果
          let res = await mwx.api.cardFaceEnhance({
            fileName
          });
          fileName = res.fileName;
          this.prevFileNameWithBg = res.fileName;
          this.prevImageWithBg = res.url;
          this.stepRecordList.push({
            fileName,
            action: '高清化'
          });
          this.originFileNameList.push(fileName);
          let r = await mwx.downloadFile(res.url);
          afterHandlerImage = r.tempFilePath;
          this.useFaceEnhance = true;
          this.resolveCheckTask({
            action: 'cardFaceScore',
            status: 'pass'
          });
        };
        if (faceBlur == 1) {
          this.resolveCheckTask({ action: 'cardFaceScore', status: 'block' });
          loadingComponent && loadingComponent.hide();
          let r = 1;
          if (times == 1) {
            if (!this.isCurrentPage()) {
              return -1;
            }
            r = await mwx.service.confirmModal({
              title: '图片模糊',
              content: '检测到图片模糊，是否提升清晰度？',
              confirmText: '智能高清',
              cancelText: '重新选图'
            });
          }

          if (r == 1) {
            loadingComponent && loadingComponent.show();
            await faceEnhance();
          } else {
            mwx.navigateBack();
            return -1;
          }
        } else if (faceBlur == 2) {
          this.resolveCheckTask({ action: 'cardFaceScore', status: 'review' });
          this.setData({
            faceHighDefinitionShow: true
          });
          this.faceEnhanceCallBack = async () => {
            // 清除缓存
            this.clearCache();
            //
            this.setData({
              checkRuleResultShow: false
            });
            try {
              await faceEnhance();
              this.setData({
                faceHighDefinitionShow: false
              });
              let checkResult = this.groupCheckRuleResult();
              if (checkResult == -1) {
                return;
              }
              //
            } catch (error) {
              mwx.hideLoading();
              throw error;
            }
            // await scoreAndEnhance_step3();
            await retouchAndAdjustPosition_step4();
            this.setData({ handlingImageLoading: false });
            this.canCreateSixCard = await this.checkIfCanCreateSixCard();
          };
        } else {
          this.resolveCheckTask({ action: 'cardFaceScore', status: 'pass' });
        }
      };

      if (!this.isCurrentPage()) {
        return;
      }
      let step3Result = await scoreAndEnhance_step3();
      if (step3Result == -1) {
        return;
      }
      let checkResult3 = this.groupCheckRuleResult();
      if (checkResult3 == -1) {
        return;
      }
      this.setData({
        currentCheckRuleText: `证件照生成中，请稍等`
      });
      // 4. 图片压缩上传
      let retouchAndAdjustPosition_step4 = async ({ times = 1 } = {}) => {
        mwx.log.info('4.图片压缩上传');
        let beforeImageInfo = await mwx.getImageInfo(afterHandlerImage);
        afterHandlerImage = await mwx.service.useCompressImage({
          imageSrc: afterHandlerImage,
          quality: 100,
          maxWidth: 1365,
          maxHeight: 1365,
          self: this,
          beforeHook: () => {
            this.setData({
              compressImageShow: true
            });
            return mwx.util.pollCheck(() =>
              this.selectComponent('.compressImage')
            );
          },
          afterHook: () => {
            this.setData({
              compressImageShow: false
            });
          }
        });
        // mwx.saveImageToPhotosAlbum({ filePath: afterHandlerImage });
        this.afterHandlerImage = afterHandlerImage;
        let info = await mwx.getImageInfo(afterHandlerImage);

        if (
          beforeImageInfo.width != info.width ||
          beforeImageInfo.height != info.height
        ) {
          let uploadRes = await mwx.api.checkImage(afterHandlerImage, this, {
            origin: 1,
            riskyCheck: 0,
            resize: 1980,
            poi: 2009
          });
          fileName = uploadRes.fileName;
          this.prevFileNameWithBg = fileName;
          this.prevImageWithBg = uploadRes.url;
          mwx.log.info('抠图前的图片进行压缩并上传');
          if (uploadRes.checkStatus != 1) {
            mwx.event.emit('faceFail', {
              message: '网络连接超时,请稍后重试'
            });
            this.goFailBack({ type: uploadRes.checkStatus == -1 ? 3 : 4 });
            return;
          }
        }
        this.imageInfo = info;
        this.cardScale = info.width / cardInfo.w;

        this.setData({
          loadingText: '图片风险检测中'
        });

        // 5. 进行抠图
        mwx.log.info('5.进行抠图');
        this.afterCropFileName = fileName;
        if (checkStatus == 1) {
          this.setData({
            loadingText: '证件照生成中'
          });
          mwx.api
            .cardFaceAttribute({
              fileName: this.prevFileNameWithBg
            })
            .then((res) => {
              this.changeClothRecommand = res;
            });
          let res = await mwx.api.v5ImageSegmentUrl(fileName);
          this.stepRecordList.push({
            fileName: res.fileName,
            action: '抠图'
          });
          this.alphaFileName = res.fileName;
          this.originFileNameList.push(res.fileName);
          wx.setStorageSync('originFileNameList', this.originFileNameList);

          // offsetTop为Y轴方向向下偏移量
          let {
            offset: offsetTop,
            invalid,
            x1,
            x2
          } = await this.faceCheck.calculateHeightOffset({
            imagePath: res.url,
            width: info.width,
            height: info.height,
            x: cropInfo.rect[0],
            y: cropInfo.rect[1],
            bottomHeight: cropInfo.bottomHeight
          });
          if (invalid) {
            if (times == 1) {
              await faceAngleCrop_step2({ times: 2 });
              await scoreAndEnhance_step3({ times: 2 });
              await retouchAndAdjustPosition_step4({ times: 2 });
              return;
            }
          }
          // 测试数据
          // x1 = 90;
          // x2 = info.width - 80;
          let leftSpaceWidth = x1;
          let rightSpaceWidth = info.width - x2;
          // debugger;
          getApp().globalData.cardImageList.push({
            fileName: res.fileName,
            url: res.url,
            text: 'adjustPosition before'
          });
          let min = 5;
          console.log(
            `offsetTop=${offsetTop}, leftSpaceWidth=${leftSpaceWidth}, rightSpaceWidth=${rightSpaceWidth}`
          );

          this.adjustPositionTask = Promise.resolve();
          if (
            Math.abs(offsetTop) > 0 ||
            Math.abs(leftSpaceWidth) > min ||
            Math.abs(rightSpaceWidth) > min
          ) {
            res.url = await this.selectComponent('.crop-image').adjustPosition({
              imageSrc: res.url,
              width: info.width,
              height: info.height,
              offsetTop,
              leftSpaceWidth,
              rightSpaceWidth
            });
            // this.adjustPositionParams = {
            //   width: info.width,
            //   height: info.height,
            //   offsetTop,
            //   leftSpaceWidth,
            //   rightSpaceWidth
            // };
            this.adjustPositionTask = mwx.api
              .checkImage(res.url, null, {
                riskyCheck: 0,
                originFileNameList: [],
                origin: 2
              })
              .then(async (r) => {
                r.url = (await mwx.downloadFile(r.url)).tempFilePath;
                return r;
              });
            // 图片上传不阻塞页面展示
            this.adjustPositionTask.then((r) => {
              this.alphaFileName = r.fileName;
              this.originFileName = r.fileName; // 抠图之后的原图FileName

              // 初始化状态
              searchEffectStatus = this.createSearchEffectStatus();
              searchEffectStatus.setStatus({
                type: 'origin',
                data: {
                  fileName: r.fileName,
                  cardImageSrc: r.url,
                  originCardImageSrc: r.url
                }
              });

              this.setData({
                originCardImageSrc: r.url,
                cardImageSrc: r.url
              });

              // this.setRecord({
              //   key: 'cardImageSrc',
              //   val: r.url,
              //   text: '初始化'
              // });
            });
            // mwx.saveImageToPhotosAlbum({ filePath: res.url });
          } else {
            this.adjustPositionParams = null;
            this.originFileName = res.fileName; // 抠图之后的原图FileName

            // 初始化状态
            searchEffectStatus = this.createSearchEffectStatus();
            searchEffectStatus.setStatus({
              type: 'origin',
              data: {
                fileName: res.fileName,
                cardImageSrc: res.url,
                originCardImageSrc: res.url
              }
            });
          }
          this.setData({
            originCardImageSrc: res.url,
            cardImageSrc: res.url
          });
          this.checkIfNeedShowClothAlt(); // TODO 优化应该放在抠图之前，但是目前似乎会阻塞流程

          getApp().globalData.cardImageList.push({
            url: res.url,
            text:
              'adjustPosition after,stepRecordList=' +
              JSON.stringify(this.stepRecordList)
          });

          if (this.data.activeColorIndex == -1) {
            // 不换底色
            this.switchColor({ detail: -1, isSkip: true });
          }
          mwx.log.info('完成制作');
        } else {
          mwx.event.emit('faceFail', {
            message: '网络连接超时,请稍后重试'
          });
          this.goFailBack({ type: checkStatus == -1 ? 3 : 4 });
          return;
        }
      };

      if (!this.isCurrentPage()) {
        return;
      }
      await retouchAndAdjustPosition_step4();
      this.setData({
        checkRuleLoadingShow: false,
        handlingImageLoading: false
      });
      this.canCreateSixCard = await this.checkIfCanCreateSixCard();
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },
  groupCheckRuleResult() {
    // console.log('------\n[人脸检测结果]', this.data.checkRuleList);
    // console.log('------');
    // 1. 有block的需要直接返回
    let blockedList = this.data.checkRuleList.filter(
      (v) => v.status == 'block'
    );
    let reviewList = this.data.checkRuleList.filter(
      (v) => v.status == 'review'
    );
    if (blockedList.length) {
      // console.log('------\n[人脸检测拦截]', blockedList);
      // console.log('------');
      mwx.event.emit('faceFail', {
        failType: 'faceCheck',
        blockedList,
        message: '图片不符合要求'
      });
      this.goFailBack({ type: 3 });
      return -1;
    } else if (reviewList.length) {
      console.log('[review]', reviewList);
      this.setData({
        checkAltInfo: {
          status: 'review',
          text: `照片有${reviewList.length}项优化建议`
        }
      });
    } else {
      this.setData({
        checkAltInfo: {
          status: 'pass',
          text: `${this.data.checkRuleList.length}项合格性检测通过`
        }
      });
    }
  },
  resolveCheckTask({ action, status = 'pass', msg, desc = '' }) {
    let { checkRuleList } = this.data;
    let loadingTextMap = {
      checkImage: '风险图片检测中',
      cardFaceDetect: '人脸区域检测中',
      cardFaceScore: '照片清晰度检测中'
    };
    checkRuleList.forEach((v) => {
      if (v.action == action) {
        this.setData({
          currentCheckRuleText: `${loadingTextMap[action] || '合格性检测中'
            }，请稍等`
        });
        v.status = status;
        v.msg = msg;
        v.desc = desc;
      }
    });
    this.setData({ checkRuleList });
  },
  async checkIfCanCreateSixCard() {
    try {
      let cardInfo = mwx.action.getCardInfo() || {};
      let dpi = cardInfo.dpi || 300;
      let canvasWidth = Math.round(1793 * (dpi / 300)); // 1793：300dpi下的宽度
      let canvasHeight = Math.round(1203 * (dpi / 300)); // 1203：300dpi下的高度
      let { width, height } = await mwx.getImageInfo(this.data.cardImageSrc);
      if (this.cardScale) {
        width = width / this.cardScale;
        height = height / this.cardScale;
      }
      if (cardInfo && cardInfo.w) {
        // 修正误差
        height = width / (cardInfo.w / cardInfo.h);
      }
      if (
        (width > canvasWidth && height > canvasHeight) ||
        (width > canvasHeight && height > canvasWidth)
      ) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      mwx.log.error(error);
      return true;
    }
  },
  async useSixCardComponentCreate(imgSrc, opt) {
    let cardInfo = mwx.action.getCardInfo() || {};
    this.setData({
      sixCardComponentShow: true
    });
    await mwx.pollCheck(() => this.selectComponent('.sixcard'));
    let config = {
      ...opt,
      h: cardInfo.h,
      w: cardInfo.w,
      _name: cardInfo.name,
      dpi: cardInfo.dpi
    };

    return this.selectComponent('.sixcard')
      .createCard(imgSrc, config)
      .then((r) => {
        this.sixCardCount = r.maxCardCols * r.maxCardRows;
        return r.imageSrc;
      })
      .catch((err) => {
        console.log('useSixCardComponentCreate fail', err);
        throw err;
      })
      .finally(() => {
        this.setData({
          sixCardComponentShow: false
        });
        wx.setStorageSync('sixCardCreateInfo', { ...config, imgSrc });
      });
  },
  async createSixCardImage(imgSrc, isOriginImage) {
    let {
      activeColorIndex,
      activeBeautyIndex,
      colorList,
      cardBottomText,
      cardWidth,
      cardInfo,
      activeClothId
    } = this.data;
    let key = `[createSixCardImage]:imgSrc=${imgSrc},activeColorIndex=${activeColorIndex},activeBeautyIndex=${activeBeautyIndex},cardBottomText=${cardBottomText},activeClothId=${activeClothId}`;
    let data = cache.get(key);
    let proTask;
    if (data) {
      proTask = Promise.resolve(data);
    } else {
      proTask = this.useSixCardComponentCreate(imgSrc, {
        ...this.getActiveColorInfo(),
        imageScale: this.cardScale,
        cardBottomText,
        fontSize: Math.round((cardInfo.w / cardWidth) * 16), // 295:一寸的宽  12：一寸的字体大小
        textBoxHeight: Math.round((cardInfo.w / cardWidth) * 24)
      }).then((sixCardImageSrc) => {
        cache.set(key, sixCardImageSrc);
        // let cardInfo = mwx.action.getCardInfo() || {};
        // if (cardInfo.sizeRange) {
        // this.minifyImage(sixCardImageSrc, cardInfo.sizeRange).then((v) => {
        //   this.minifyCardImageSrc = v;
        // });
        // }
        return sixCardImageSrc;
      });
    }
    if (!isOriginImage) {
      this.setData({
        sixCardImageSrc: ''
      });
    }

    let sixCardImageSrc = await proTask;
    console.log('sixCardImageSrc', sixCardImageSrc, data ? '使用缓存' : '新建');
    if (isOriginImage) {
      // 仅用于获取原图
      return sixCardImageSrc;
    }
    this.setData({
      sixCardImageSrc
    });

    if (activeBeautyIndex == 0) {
      this.setData({
        originSixCardImageSrc: sixCardImageSrc
      });
    }
    // mwx.saveImageToPhotosAlbum({ filePath: sixCardImageSrc });
    mwx.action.setSixCardImage(this.data.sixCardImageSrc);
  },
  getColorList() {
    let cardInfo = mwx.action.getCardInfo() || {};
    this.setData({
      colorList: getColorList(cardInfo.background)
    });
  },
  async initView() {
    // 25*35mm，dpi=300时对应的像素为295*413px
    let cardInfo = mwx.action.getCardInfo() || {};
    const dpiRatio = 11.8;

    this.setData({
      cardInfo
    });
    this.getColorList();
    if (this.isFromSelectTypeChagneBg && this.query.origin == 1) {
      mwx.log.info('换底色:原图尺寸');
      this.useOriginImageSize = true;
      this.setData({
        isUseOriginImage: true
      });
      await this.retouchOriginImage();
    } else {
      await this.faceDetect();
    }

    let windowHeight = app.globalData.systemInfo.screenHeight;
    let navbarHeight = app.globalData.navbarHeight;
    // .footer的高度
    let footerHeight =
      (app.globalData.isIPX ? 388 : 320) / app.globalData.px2rpx;

    let containerHeight = windowHeight - navbarHeight - footerHeight;

    // 顶部.switch__btns高度的height为88,marginTop=24
    let topHeight = (88 + 24) / getApp().globalData.px2rpx;
    let bottomHeight = 80 / getApp().globalData.px2rpx;

    let maxCardHeight =
      containerHeight -
      topHeight -
      bottomHeight -
      this.data.cardOutBorderWidth * 2 -
      this.data.cardPaddingTop * 2;
    let maxCardWidth =
      app.globalData.systemInfo.windowWidth -
      this.data.cardLeftRightMargin * 2 -
      this.data.cardOutBorderWidth * 2;
    console.log(
      `windowHeight=${windowHeight},containerHeight=${containerHeight},topHeight=${topHeight},bottomHeight=${bottomHeight},cardOutBorderWidth=${this.data.cardOutBorderWidth},cardPaddingTop=${this.data.cardPaddingTop}`
    );
    console.log(`maxCardHeight=${maxCardHeight},maxCardWidth=${maxCardWidth}`);
    this.setData({
      maxCardHeight,
      maxCardWidth
    });

    if (cardInfo.unit == 'px') {
      if (!cardInfo.w) {
        // 此时cardInfo.width表示对应的px宽度
        cardInfo.w = cardInfo.width;
        cardInfo.h = cardInfo.height;
        cardInfo.width = Math.round(cardInfo.w / dpiRatio);
        cardInfo.height = Math.round(cardInfo.h / dpiRatio);
      }
    } else if (cardInfo.unit == 'mm') {
      if (!cardInfo.w) {
        cardInfo.w = Math.round(cardInfo.width * dpiRatio);
        cardInfo.h = Math.round(cardInfo.height * dpiRatio);
      }
    }
    if (cardInfo.background) {
      let ind = this.data.colorList
        .map((v) => v.color)
        .indexOf(cardInfo.background);
      this.setData({
        activeColorIndex: ind == -1 ? 0 : ind
      });
    }

    // 制作的证件照比例
    let cardRatio = cardInfo.width / cardInfo.height;
    let cardTransformRatio = cardInfo.unit == 'px' ? 1 : dpiRatio;
    // 实际绘制的证件宽高
    let actualCardWidth = cardInfo.width * cardTransformRatio;
    let actualCardHeight = cardInfo.height * cardTransformRatio;
    let containerRatio = maxCardWidth / maxCardHeight;
    // 界面中的证件宽高
    let cardWidth;
    let cardHeight;

    if (cardRatio > containerRatio) {
      cardWidth = maxCardWidth;
      cardHeight = cardWidth / cardRatio;
    } else {
      cardHeight = maxCardHeight;
      cardWidth = cardHeight * cardRatio;
    }
    this.setData({
      cardWidth,
      cardHeight
    });
  },
  goVip() {
    mwx.service.getVip(40);
  },
  // showVideoAd() {
  //   mwx.service.showVideoAd(() => {
  //     this.createCard();
  //   }, mwx.config.appConfig.rewardedVideoAd);
  // },
  hideAdAlt() {
    this.setData({
      adAltShow: false
    });
  },
  async createSingleCard({ type = 'origin' } = {}) {
    let {
      activeColorIndex,
      activeBeautyIndex,
      cardImageSrc,
      cardBottomText,
      cardInfo,
      cardWidth,
      cardHeight,
      colorList,
      activeClothId
    } = this.data;
    await this.adjustPositionTask;
    let key = `[createSingleImage]:imgSrc=${cardImageSrc},activeColorIndex=${activeColorIndex},activeBeautyIndex=${activeBeautyIndex},cardBottomText=${cardBottomText},type=${type},activeClothId=${activeClothId}`;
    let data = cache.get(key);
    let proTask;
    let config = {
      imageSrc: cardImageSrc,
      canvasWidth: this.imageInfo.width,
      canvasHeight: this.imageInfo.height,
      text: cardBottomText,
      colorInfo: this.getActiveColorInfo(),
      type,
      cardInfo,
      fontSizeScale: 16 / cardWidth, // 295:一寸的宽  12：一寸的字体大小
      textBoxHeightScale: 24 / cardWidth,
      activeClothId
    };
    if (data) {
      proTask = Promise.resolve(data);
      if (type == 'origin') {
        wx.setStorageSync('highOriginConfig', config);
        config.destWidth = cardInfo.w;
        config.destHeight = cardInfo.h;
        if (this.useOriginImageSize && cardInfo.originImageWidth) {
          config.destWidth = cardInfo.originImageWidth;
          config.destHeight = cardInfo.originImageHeight;
          config.useOriginImageSize = true;
        }
      }
    } else {
      if (type == 'origin') {
        wx.setStorageSync('highOriginConfig', config);
        config.destWidth = cardInfo.w;
        config.destHeight = cardInfo.h;
        if (this.useOriginImageSize && cardInfo.originImageWidth) {
          config.destWidth = cardInfo.originImageWidth;
          config.destHeight = cardInfo.originImageHeight;
          config.useOriginImageSize = true;
        }
      }
      wx.setStorageSync('singleCardCreateInfo', {
        ...config,
        destWidth: cardInfo.w,
        destHeight: cardInfo.h
      });
      try {
        mwx.pollCheck(() => !this.singleCardTaskBlock, 100, 5000);
      } catch (error) {
        mwx.log.error('createSingleCard wait timeout');
      }
      this.singleCardTaskBlock = true;
      proTask = this.selectComponent('.crop-image')
        .createSingleCard(config)
        .then(async (res) => {
          if (type == 'origin') {
            // 输出300dpi
            // try {
            //   res = await mwx.service.changeDpi({
            //     url: res,
            //     dpi: 300
            //   });
            // } catch (error) {
            //   mwx.log.error(error);
            // }
          }

          if (type == 'origin') {
            // 压缩图片
          }
          cache.set(key, res);
          return res;
        })
        .finally(() => {
          this.singleCardTaskBlock = false;
        });
    }

    // 重置状态
    if (type == 'origin') {
      this.singleCardImageSrc = '';
    } else {
      // 生成带水印的图片
      this.singleCardImageSrcWithWatermark = '';
    }

    let res = await proTask;
    console.log(
      'createSingleCard',
      cardImageSrc,
      res,
      data ? '使用缓存' : '新建'
    );
    // 生成原图
    if (type == 'origin') {
      this.singleCardImageSrc = res;
      mwx.action.setCardImage(res);
    } else if (type == 'preview') {
      // 生成带水印的图片
      this.singleCardImageSrcWithWatermark = res;
    }
  },
  /**
   * @param {*} originImageSrc 原始图片链接
   * @param {*} sizeRange 格式为 min~max
   */
  async minifyImage(originImageSrc, sizeRange) {
    let info = await mwx.getFileInfo(originImageSrc);
    let [min, max] = sizeRange.split('~');
    let size = info.size / 1024;
    let quality = 50;
    let startQuality = 0;
    let endQuality = 100;
    // 图片质量无法增大，所以图片小于最大尺寸的都直接返回
    if (size <= max) {
      return originImageSrc;
    } else {
      let handle = async (quality) => {
        let src = (
          await mwx.compressImage({
            src: originImageSrc,
            quality: 1
          })
        ).tempFilePath;
        let size = (await mwx.getFileInfo(src)).size;
        return {
          src,
          size
        };
      };
      let minInfo = await handle(0);
      // 最小压缩质量都大于最大要求的尺寸,那就直接返回
      if (minInfo.size >= max) {
        return minInfo.src;
      } else {
        let info = await handle(quality);
        while (info.size > max || info.size < min) {
          if (info.size > max) {
            endQuality = quality;
            quality = (startQuality + quality) / 2;
          } else {
            startQuality = quality;
            quality = (endQuality + quality) / 2;
          }
          info = await handle(quality);
        }
        console.log('压缩后size', info.size);
        return info.src;
      }
    }
  },
  async switchColor(e) {
    await this.adjustPositionTask;
    let index = e.detail;
    this.prevActiveColorIndex = this.data.activeColorIndex;
    if (this.prevActiveColorIndex == index && !e.isSkip) {
      return;
    }
    if (index == -1 && this.data.activeClothId) {
      mwx.Toast('换装后不支持不换底');
      return;
    }

    this.setData({
      activeColorIndex: index
    });

    // index=-1为采用原图背景
    if (index == -1) {
      // 从其他底色切换到原图
      this.clearCache();

      // 原图换底色, 存储之前的图片
      this.setData({
        cardImageSrc: this.prevImageWithBg,
        originCardImageSrc: this.prevImageWithBg
      });

      // 此时没有美颜、补光、换装，记录不换底的初始状态
      searchEffectStatus.setStatus({
        type: 'origin',
        data: {
          fileName: this.prevFileNameWithBg,
          cardImageSrc: this.prevImageWithBg,
          originCardImageSrc: this.prevImageWithBg
        }
      });
    } else {
      // 从原图切换到其他底色
      if (this.prevActiveColorIndex == -1) {
        this.clearCache();

        // 获取原始抠图
        let info = searchEffectStatus.getStatus({
          type: 'origin'
        });

        this.setData({
          cardImageSrc: info.originCardImageSrc,
          originCardImageSrc: info.originCardImageSrc
        });

        searchEffectStatus.setStatus({
          type: 'origin',
          data: {
            cardImageSrc: info.originCardImageSrc
          }
        });
      }
    }

    // 清除已生成的证件照
    this.clearExistCard();
    if (this.data.activeViewTypeIndex == 1) {
      await this.waitCreateSixCard();
    }
  },
  async waitCreateSixCard() {
    let timer = setTimeout(() => {
      mwx.showLoading('正在处理中...', true);
    }, 200);
    try {
      await this.createSixCardImage(this.data.cardImageSrc);
      clearTimeout(timer);
    } catch (error) {
      mwx.log.error(error);
      clearTimeout(timer);
    }
    mwx.hideLoading();
  },
  onShareAppMessage() {
    let config = {
      title: `免费制作证件照，换底色，推荐你使用`,
      path: `/pages/index/index?from=share`
    };
    let promise = new Promise(async (resolve, reject) => {
      if (this.shareType == 'activity') {
        await mwx.pollCheck(() => this.logId, 100, 2500);
      }
      config.title = '@你，帮我助力一下，好人一生平安';
      config.imageUrl =
        'https://img.elfinbook.com/20230704/0/0BCA138DA2674CAC.png';
      config.path = '/pages/shareFriend/index?logId=' + this.logId;
      config.path = mwx.service.urlAddStoreId(config.path);
      resolve(config);
    });
    return {
      ...config,
      promise
    };
  },
  async goBack() {
    if (this.isGoFinishCard) {
      mwx.showModal({
        title: '提示',
        content: '确定要放弃当前制作吗',
        success: async (res) => {
          if (res.confirm) {
            mwx.navigateBack(1);
          }
        }
      });
      return;
    }
    let task = this.createSingleCard({ type: 'origin' });
    mwx.showModal({
      title: '提示',
      content: '确定要放弃当前制作吗',
      success: async (res) => {
        if (res.confirm) {
          try {
            await task;
          } catch (error) { }
          mwx.navigateBack(1);
          this.uploadUnSaveCard();
        }
      }
    });
  },
  uploadUnSaveCard() {
    let originFileNameList = wx.getStorageSync('originFileNameList') || [];
    let img = this.singleCardImageSrc;
    let key = 'uploadUnSaveCard:' + img;
    if (cache[key] || !img || getApp().globalData.isPc) {
      return;
    }
    mwx.api
      .checkImage(img, null, {
        riskyCheck: 0,
        originFileNameList,
        poi: 2002
      })
      .then((r) => {
        cache[key] = 1;
      });
  },
  goHome() {
    mwx.switchTab({ url: '/pages/index/index' });
  },
  async switchToolIndex(e) {
    let { toolList, beautyStatus, highDefinitionStatus, lightStatus } =
      this.data;
    let index = e.currentTarget.dataset.index;
    let item = toolList[index];
    this.setData({
      activeToolIndex: index
    });
    switch (item.type) {
      case 'changeColor':
        this.setData({
          colorSelectShow: true
        });
        this.previewColorIndex = this.data.activeColorIndex || 0;
        break;
      case 'beauty':
        if (
          beautyStatus != 1 &&
          highDefinitionStatus != 1 &&
          lightStatus != 1
        ) {
          this.switchBeauty({
            index: beautyStatus ? 0 : 1,
            type: 'beauty'
          });
        } else {
          mwx.Toast('请等待其他操作处理完成，再进行操作');
        }
        break;
      case 'changeClothes':
        this.showClothTool();
        break;
      case 'addText':
        this.handleCardBottomText();
        break;
      case 'addLight':
        if (
          beautyStatus != 1 &&
          highDefinitionStatus != 1 &&
          lightStatus != 1
        ) {
          this.switchBeauty({
            index: lightStatus ? 0 : 1,
            type: 'light'
          });
        } else {
          mwx.Toast('请等待其他操作处理完成，再进行操作');
        }
        break;
    }
  },
  hideFocus() {
    this.setData({
      isHandling: false
    });
  },
  async switchView(e) {
    let ind = e.currentTarget.dataset.index;
    if (!this.canCreateSixCard && ind == 1) {
      return this.confirmGoBackAdjustSize();
    }
    this.setData({
      activeViewTypeIndex: ind
    });
    mwx.report('createcard_switchtab');
    if (ind == 1) {
      let loadDanmuTask;
      if (this.barrageList && this.barrageList.length) {
        loadDanmuTask = Promise.resolve(this.barrageList);
      } else {
        loadDanmuTask = mwx.api.cardBarrage().then((res) => {
          this.barrageList = res.list;
          return res.list;
        });
      }
      wx.setStorageSync('isRedPointShow', 1);
      this.setData({
        redPointShow: false
      });
      await this.waitCreateSixCard();
      await loadDanmuTask;
      this.launchDanmu();
    } else {
      this.isStopLaunchDanmu = true;
      this.setData({
        danmu: ''
      });
    }
  },
  launchDanmu() {
    let list = this.barrageList;
    this.isStopLaunchDanmu = false;
    let num = 0;
    num = (num + 1) % (list.length - 1);
    let launch = (time) => {
      let waitTime = time || Math.floor(Math.random() * 3 + 7);
      // console.log('waitTime', waitTime);
      setTimeout(() => {
        num = (num + 1) % (list.length - 1);
        this.setData({
          danmu: ''
        });
        setTimeout(() => {
          this.setData({
            danmu: list[num]
          });
        }, 100);
        if (!this.isStopLaunchDanmu) {
          launch();
        }
      }, waitTime * 1000);
    };
    launch(2);
  },
  stopLaunch() {
    this.isStopLaunchDanmu = true;
    this.setData({
      danmu: ''
    });
  },
  hideSaveBox() {
    this.setData({
      saveBoxShow: false
    });
  },
  createOrderInfo() {
    let { appreciationProduct, cardProduct, sixCardImageSrc, cardImageSrc } =
      this.data;
    let cardInfo = mwx.action.getCardInfo();
    let buyCardInfo = {
      cardProduct,
      appreciationProduct,
      singleCardImageSrc: cardImageSrc,
      cardImageSrc: sixCardImageSrc,
      cardName: cardInfo.name,
      cardSize:
        cardInfo.isOrigin && this.useOriginImageSize
          ? `${cardInfo.originImageWidth}  x  ${cardInfo.originImageHeight} px`
          : `${cardInfo.w}  x  ${cardInfo.h} px`,
      afterCropFileName: this.afterCropFileName,
      sixCardCount: this.sixCardCount
    };
    console.log('订单信息buyCardInfo', buyCardInfo);
    return buyCardInfo;
  },
  savePaperCard: mwx.util.ignoreMultiClick(async function () {
    if (!this.canCreateSixCard) {
      return this.confirmGoBackAdjustSize();
    }
    wx.reportEvent('createcard_clickprint', {
      printbutton_firsttext: this.data.printbutton_firsttext,
      printbutton_color: this.data.printbutton_color,
      printbutton_secondtext: this.data.cardProduct.tips || ''
    });
    await this.createCard({ cardProductId: -3 });
    let buyCardInfo = this.createOrderInfo();
    wx.setStorageSync('buyCardInfo', buyCardInfo);
    wx.navigateTo({
      url:
        '/packageA/submitOrder/index?activeClothId=' +
        (this.data.activeClothId || '')
    });
    setTimeout(() => {
      this.setData({ activeViewTypeIndex: 1 });
    }, 1000);
  }),
  // 点击保存电子照（保存排版照）
  saveCard: mwx.util.ignoreMultiClick(async function () {
    let userInfo = mwx.action.getUserInfo() || {};
    let isVip = userInfo.level > 0;
    mwx.log.info('saveCard:isVip=' + isVip);
    mwx.report('createcard_clicksave');
    // 换装的处理逻辑
    if (this.data.activeClothId) {
      // 使用了换装，不管是否是vip都需要支付
      await this.createCard({
        cardProductId: -1,
        loadingShow: true
      });
      let buyCardInfo = this.createOrderInfo();
      wx.setStorageSync('buyCardInfo', buyCardInfo);
      let activeColorInfo = this.getActiveColorInfo();
      buyCardInfo.color = activeColorInfo.color;
      buyCardInfo.colorImgUrl = activeColorInfo.colorImgUrl;
      buyCardInfo.singleCardImageSrc = this.data.cardImageSrc;
      mwx.hideLoading();
      if (this.data.isIos) {
        if (!this.canCreateSixCard) {
          mwx.Toast(
            '无法生成六寸排版照，暂不支持保存换装后的电子照',
            null,
            3000
          );
          return;
        }
        mwx.navigateTo({
          url: `/packageA/submitChangeClothOrder/index?type=${this.query.from || ''
            }&sixCardCount=${this.sixCardCount || ''}&useOriginImageSize=${this.useOriginImageSize ? 1 : ''
            }&activeClothId=${this.data.activeClothId || ''}`
        });
      } else {
        // 换装支付
        this.setData({
          clothSaveBoxShow: true,
          boxData: buyCardInfo
        });
      }
      return;
    }
    if (isVip) {
      await this.createCard({ cardProductId: -2 });
      this.isGoFinishCard = true;
      this.goFinishCard();
    } else {
      await this.createCard({
        cardProductId: -1,
        loadingShow: true
      });
      let buyCardInfo = this.createOrderInfo();
      wx.setStorageSync('buyCardInfo', buyCardInfo);
      let activeColorInfo = this.getActiveColorInfo();
      buyCardInfo.color = activeColorInfo.color;
      buyCardInfo.colorImgUrl = activeColorInfo.colorImgUrl;
      buyCardInfo.singleCardImageSrc = this.data.cardImageSrc;
      mwx.hideLoading();
      if (this.data.activeViewTypeIndex == 0) {
        this.setData({
          saveBoxShow: true,
          boxData: buyCardInfo
        });
      } else {
        let cardImage = mwx.action.getCardImage();
        // 先上传图片，不生成记录
        let r = await mwx.service.uploadFinishCreateSingleCard({
          cardImage
        });
        mwx.navigateTo({
          url:
            `/packageA/saveCompose/index?needCreateHistory=1&fileName=${r.fileName || ''}`
        });
      }
    }
  }),

  getActiveColorInfo() {
    return this.data.activeColorIndex == -1
      ? {
        color: '', // 不换底不设置颜色
        colorText: '原图',
        useOriginImageAsBg: true
      } // TODO 颜色暂时设置一个，以防其他地方报错
      : this.data.colorList[this.data.activeColorIndex];
  },
  async createCard({ cardProductId, loadingShow = true }) {
    let showLoading = [-1, -2, -3].indexOf(cardProductId) > -1;
    mwx.log.info(`createCard:cardProductId=${cardProductId},start`);
    let cardInfo = mwx.action.getCardInfo() || {};
    let itemColor = this.getActiveColorInfo();
    let bgColor =
      itemColor.custom || itemColor.gradient
        ? mwx.service.formatBgColor(itemColor)
        : itemColor.gradient
          ? itemColor.startColor
          : itemColor.color;
    if (this.data.activeColorIndex == -1) {
      bgColor = '';
    }

    mwx.action.setCardInfo({
      ...cardInfo,
      cropInfo: this.cropInfo,
      blurScore: this.blurScore,
      bgColor,
      colorImgUrl: itemColor.colorImgUrl || '', // 渐变色才有图片
      faceBeauty: this.data.beautyStatus == 2 ? 1 : 0,
      cardProductId,
      faceEnhance: this.useFaceEnhance ? 1 : 0,
      alphaFileName: this.currentAlphaFileName || this.alphaFileName || '',
      text: this.data.cardBottomText || '',
      faceLight: this.data.lightStatus == 2 ? 1 : 0
    });
    try {
      let taskList = [];
      let task = Promise.resolve();
      // debugger;
      if (!this.singleCardImageSrc) {
        task = this.createSingleCard();
        taskList.push(task);
      }
      if (!this.data.sixCardImageSrc) {
        taskList.push(this.createSixCardImage(this.data.cardImageSrc));
      }
      if (taskList.length) {
        if (showLoading && loadingShow) {
          mwx.showLoading('正在处理中...', true);
        }
        await Promise.all(taskList);
        mwx.log.info(`createCard:finish`);
        if (showLoading) {
          mwx.hideLoading();
        }
      }
    } catch (error) {
      mwx.log.info(`createCard:fail`);
      mwx.log.error(error);
    }
  },
  setCardProductId({ cardProductId }) {
    let cardInfo = mwx.action.getCardInfo() || {};
    console.log('setCardProductId', cardProductId);
    mwx.action.setCardInfo({
      ...cardInfo,
      cardProductId,
      faceLight: this.data.lightStatus == 2 ? 1 : 0
    });
  },
  clickSaveCardBox: mwx.util.ignoreMultiClick(async function (e) {
    mwx.log.info('clickSaveCardBox: type=' + e.detail);
    switch (e.detail) {
      case 'share':
        mwx.report('savesingle_clickshare');
        this.setCardProductId({ cardProductId: -4 });
        this.shareType = 'activity';
        return mwx.service
          .createCardHistory({
            activeClothId: this.data.activeClothId
          })
          .then((r) => {
            this.logId = r.logId;
            setTimeout(() => {
              mwx.navigateTo({
                url: '/pages/shareFriend/index?logId=' + (r.logId || '')
              });
            }, 1000);
          });
      case 'buy':
        if (!this.canCreateSixCard) {
          return this.confirmGoBackAdjustSize();
        }
        this.setCardProductId({ cardProductId: -3 });
        wx.reportEvent('createcard_clickprint', {
          printbutton_secondtext: this.data.cardProduct.tips || ''
        });
        wx.navigateTo({ url: '/packageA/submitOrder/index' });
        setTimeout(() => {
          this.setData({ activeViewTypeIndex: 1 });
        }, 1000);
        break;
      case 'appreciation':
        mwx.report('savesingle_clickpay');
        mwx.showLoading('正在调起支付...', true);
        try {
          let res = await mwx.service.createCardHistory({
            status: 0,
            cardProductId: this.data.boxData.appreciationProduct.product,
            payWay: 9,
            scene: 39,
          });

          this.setCardProductId({
            cardProductId: this.data.appreciationProduct.product
          });
          mwx.log.info('开始调用支付');

          this.setData({
            orderCheckBoxShow: true
          });
          clearInterval(this.paymentTimer);
          this.paymentTimer = mwx.service.requestPayment({
            _type: 'appreciation',
            _orderNo: res.orderNo,
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success: async (result) => {
              mwx.log.info('完成支付');
              this.setData({
                orderCheckBoxShow: false
              });
              mwx.hideLoading();
              this.isGoFinishCard = true;
              this.goFinishCard(
                `&isAppreciation=1&skipCreateHistory=1&fileName=${res.fileName}`
              );
              console.log('---success---');
            },
            fail: (err) => {
              this.setData({
                orderCheckBoxShow: false
              });
              mwx.hideLoading();
              mwx.log.error('支付失败');
              mwx.log.error(err);
              console.log(
                ' this.data.appreciationProduct',
                this.data.appreciationProduct
              );
            },
            complete: () => {
              this.setData({
                orderCheckBoxShow: false
              });
              mwx.hideLoading();
              mwx.log.info('---complete---');
            }
          });
        } catch (error) {
          mwx.log.error(error)
        }
        mwx.hideLoading();

        break;
      case 'ad':
        mwx.report('savesingle_clickads');
        this.setCardProductId({ cardProductId: -1 });
        mwx.service.showVideoAd(
          async (cardProductId) => {
            if (cardProductId == -6) {
              this.setCardProductId({ cardProductId: -6 });
            }
            this.isGoFinishCard = true;
            this.goFinishCard();
          },
          mwx.config.appConfig.rewardedVideoAd,
          this
        );
        break;
      case 'collect':
        mwx.report('savesingle_clickaddtomyminiapp');
        if (this.isAddToMyMiniProgram) {
          this.setCardProductId({ cardProductId: -5 });
          this.goFinishCard();
        } else {
          this.setData({
            addtoMiniprogramShow: true
          });
          await mwx.pollCheck(() =>
            this.selectComponent('.addto-myminiprogram')
          );
          this.selectComponent('.addto-myminiprogram').show();
          clearInterval(this.addToMyMiniProgramTimer);
          this.addToMyMiniProgramTimer = setInterval(() => {
            wx.checkIsAddedToMyMiniProgram({
              success: (res) => {
                if (res.added) {
                  clearInterval(this.addToMyMiniProgramTimer);
                  this.closeAddToMyMiniProgram();
                } else {
                }
              }
            });
          }, 500);
        }
        break;
      case 'score':
        this.setCardProductId({ cardProductId: -8 });
        this.isGoFinishCard = true;
        this.goFinishCard();
        break;
    }
  }),
  async previewSingleCard() {
    if (!this.singleCardImageSrcWithWatermark) {
      await this.createSingleCard({ type: 'preview' });
    }
    mwx.previewImage({
      urls: [this.singleCardImageSrcWithWatermark],
      current: this.singleCardImageSrcWithWatermark,
      showmenu: false
    });
  },
  async previewSixCard() {
    let { cardInfo, cardWidth } = this.data;
    if (!this.sixCardImageSrcWithWatermark) {
      //
      let r = await this.useSixCardComponentCreate(this.data.cardImageSrc, {
        ...this.getActiveColorInfo(),
        type: 'preview',
        imageScale: this.cardScale,
        cardBottomText: this.data.cardBottomText,
        fontSize: Math.round((cardInfo.w / cardWidth) * 12), // 295:一寸的宽  12：一寸的字体大小
        textBoxHeight: Math.round((cardInfo.w / cardWidth) * 24)
      });
      this.sixCardImageSrcWithWatermark = r;
    }
    mwx.previewImage({
      urls: [this.sixCardImageSrcWithWatermark],
      current: this.sixCardImageSrcWithWatermark,
      showmenu: false
    });
  },
  // 清除已生成的证件照
  clearExistCard() {
    this.singleCardImageSrc = '';
    this.singleCardImageSrcWithWatermark = '';
    this.sixCardImageSrcWithWatermark = '';

    this.setData({
      sixCardImageSrc: '',
      originSixCardImageSrc: ''
    });
  },
  /*
   说明：美颜、补光状态切换函数  index:0 取消 1：开启 type:before:美颜、light:补光
   1. 美颜、补光操作都是基于抠好的透明图进行的
  */
  async switchBeauty({ index, type }) {
    let ind = index;
    this.setData({
      activeBeautyIndex: ind
    });
    // 清除已生成的证件照
    this.clearExistCard();

    if (this.data.activeClothId) {
      this.setData({
        [type == 'beauty' ? 'beautyStatus' : 'lightStatus']: 1
      });
      try {
        // 重新进行换装
        await this.switchCloth({
          detail: {
            clothId: this.data.activeClothId,
            beautyStatus:
              type == 'beauty' ? (ind == 0 ? 0 : 2) : this.data.beautyStatus, // type有值就设置，没有用默认的美颜状态
            lightStatus:
              type != 'beauty' ? (ind == 0 ? 0 : 2) : this.data.lightStatus
          }
        });
      } catch (error) {
        mwx.log.error(error);
        this.setData({
          beautyStatus: 0,
          lightStatus: 0
        });
      }
      return;
    }

    // console.log('switchBeauty', ind, type);
    // 无美颜
    if (ind == 0) {
      let cardImageSrc = await this.processBeatutyOrLight({
        action: type == 'beauty' ? 'removeBeauty' : 'removeLight'
      });
      // console.log('processBeatutyOrLight result', cardImageSrc);
      this.setData({
        cardImageSrc
      });
    } else {
      try {
        let cardImageSrc = await this.processBeatutyOrLight({
          action: type == 'beauty' ? 'addBeauty' : 'addLight'
        });
        console.log('processBeatutyOrLight执行后的图片', cardImageSrc);
        this.setData({
          cardImageSrc
        });
      } catch (error) {
        mwx.log.error('switchBeauty error', error);
        let cardImageSrc = await this.processBeatutyOrLight({
          action: type == 'beauty' ? 'removeBeauty' : 'removeLight'
        });
        this.setData({
          cardImageSrc
        });
      }
    }
    // 排版照视图下，生成对应的六寸照
    if (this.data.activeViewTypeIndex == 1 && !this.data.activeClothId) {
      await this.createSixCardImage(this.data.cardImageSrc);
    }
  },
  // searchEffectStatus= { originFileName,beautyFileName,lightFileName }
  // 分别对应：原始抠图的fileName, 只在originFileName基础上进行美颜的fileName,只在originFileName基础上进行补光的fileName
  /**
   *
   *
   * @param {String} {action} addBeauty、removeBeauty、addLight、removeLight
   */
  async processBeatutyOrLight({ action }) {
    let { beautyStatus, lightStatus, activeColorIndex } = this.data;
    await this.adjustPositionTask;
    console.log(
      `【processBeatutyOrLight】美颜补光状态切换, action=${action}, 之前状态：beautyStatus=${beautyStatus}, lightStatus=${lightStatus}`
    );
    let res;

    let fName;
    let statusInfo = {};
    function fixNoFileName(fName) {
      if (!fName) {
        console.error('---noFileName---');
      }
      return fName;
    }
    let specialEffectType = '';
    switch (action) {
      case 'addBeauty':
        if (lightStatus == 2) {
          // 已经补光，需要基于补光的fileName进行美颜
          statusInfo = searchEffectStatus.getStatus({
            type: 'light'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAutoBeauty(fName);
        } else {
          // 未补光，基于原图的fileName进行美颜
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAutoBeauty(fName);
          specialEffectType = 'beauty';
        }
        break;
      case 'removeBeauty':
        if (lightStatus == 2) {
          // 已经补光， 需要重新补光
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAddLight(fName);
          specialEffectType = 'light';
        } else {
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          // 未补光
          res = {
            fileName: fName,
            url: statusInfo.cardImageSrc // 返回原始图片
          };
        }
        this.setData({
          beautyStatus: 0
        });
        break;
      case 'addLight':
        if (beautyStatus == 2) {
          // 已经美颜
          statusInfo = searchEffectStatus.getStatus({
            type: 'beauty'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAddLight(fName);
        } else {
          // 未补光
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAddLight(fName);
          specialEffectType = 'light';
        }
        break;
      case 'removeLight':
        if (beautyStatus == 2) {
          // 已经美颜， 需要重新美颜
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          res = await this.getAutoBeauty(fName);
          specialEffectType = 'beauty';
        } else {
          statusInfo = searchEffectStatus.getStatus({
            type: 'origin'
          });
          fName = statusInfo.fileName;
          fName = fixNoFileName(fName);
          // 未补光
          res = {
            fileName: fName,
            url: statusInfo.cardImageSrc // 返回原始图片
          };
        }
        this.setData({
          lightStatus: 0
        });
        break;
      default:
        mwx.log.error('出错了,action未指定', action);
        break;
    }
    // 只进行美颜或者补光操作之后，进行状态更新
    if (specialEffectType) {
      searchEffectStatus.setStatus({
        type: specialEffectType,
        data: {
          fileName: res.fileName,
          cardImageSrc: res.url
        }
      });
    }
    // 记录当前最新的切换美颜、补光之后状态，用于取消换装时，状态复原
    searchEffectStatus.setStatus({
      type: 'latestEffect',
      data: {
        fileName: res.fileName,
        cardImageSrc: res.url
      }
    });
    this.currentAlphaFileName = res.fileName; // 美颜、补光后的fileName
    return res.url;
  },
  toBase64(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: imagePath, // 图片文件路径
        encoding: 'base64',
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          console.error(error);
        }
      });
    });
  },
  // 根据fileName进行美颜
  async getAutoBeauty(fileName) {
    console.log('【getAutoBeauty】美颜使用的fileName', fileName);
    this.setData({ beautyStatus: 1 });
    let key = `[getAutoBeauty]:fileName=${fileName}`;
    try {
      let data = apiCache.get(key);
      if (data) {
        console.log(`【美颜】缓存命中:fileName=${fileName}`);
        this.setData({ beautyStatus: 2 });
        return data;
      }
      let r = await mwx.api.cardFaceBeautyAsync({
        fileName
      });
      this.originFileNameList.push(r.fileName);
      wx.setStorageSync('originFileNameList', this.originFileNameList);
      let url = (await mwx.downloadFile(r.url)).tempFilePath;
      // 没有补光时，需要调整位置
      if (this.data.lightStatus != 2) {
        url = await this.getAdjustPosition(url);
      }
      this.setData({ beautyStatus: 2 });
      let result = {
        url,
        fileName: r.fileName
      };
      apiCache.set(key, result);
      return result;
    } catch (err) {
      this.setData({ beautyStatus: 0 });
      console.error('getAutoBeauty error', err);
      throw err;
    }
  },
  // 根据fileName进行补光
  async getAddLight(fileName) {
    console.log('【getAddLight】补光使用的fileName', fileName);
    this.setData({ lightStatus: 1 });
    try {
      let key = `[getAddLight]:fileName=${fileName}`;
      let data = apiCache.get(key);
      if (data) {
        console.log(`【补光】缓存命中:fileName=${fileName}`);
        this.setData({ lightStatus: 2 });
        return data;
      }
      let r = await mwx.api.cardFaceLight({
        fileName
      });
      this.originFileNameList.push(r.fileName);
      wx.setStorageSync('originFileNameList', this.originFileNameList);
      let url = (await mwx.downloadFile(r.url)).tempFilePath;
      // 没有美颜时，需要调整位置
      if (this.data.beautyStatus != 2) {
        url = await this.getAdjustPosition(url);
      }
      this.setData({ lightStatus: 2 });
      let result = {
        url,
        fileName: r.fileName
      };
      apiCache.set(key, result);
      return result;
    } catch (err) {
      this.setData({ lightStatus: 0 });
      console.error('getAddLight error', err);
      throw err;
    }
  },
  // 补光美颜之后都需要进行的操作
  async getAdjustPosition(r) {
    // if (this.adjustPositionParams) {
    //   r = await this.selectComponent('.crop-image').adjustPosition({
    //     imageSrc: r,
    //     ...this.adjustPositionParams
    //   });
    // }
    return r;
  },
  async switchToOrigin() {
    // 美颜六寸照生成的几种情况：
    // 1. 单张美颜，切换到排版照，自动生成美颜照（原图六寸可能不存在）
    // 2. 单张不美颜，切换到排版照，再进行美颜（原图和美颜六寸都存在）
    if (
      !this.data.originSixCardImageSrc &&
      this.data.activeViewTypeIndex == 1
    ) {
      let r = await this.createSixCardImage(this.data.originCardImageSrc, true);
      this.setData({
        originSixCardImageSrc: r
      });
    }
    this.setData({
      originImageShow: true
    });
  },
  switchToFixed() {
    this.setData({
      originImageShow: false
    });
  },
  isCurrentPage() {
    let route = getCurrentPages();
    let page = route[route.length - 1];
    let r = page.route == 'packageA/createCard/index';
    return r;
  },
  goFailBack({ type }) {
    if (!this.isCurrentPage()) {
      return;
    }
    wx.reportEvent('createcard_imageinvalid', {
      cardfail_reason: type
    });
    try {
      mwx.log.warn(
        '证件照制作失败：stepRecordList=' + JSON.stringify(this.stepRecordList)
      );
      if (this.originFileNameList[0]) {
        mwx.api.cardMask({
          fileName: this.originFileNameList[0],
          mask: type
        });
      }
    } catch (error) { }
    if (this.isFromSelectTypeChagneBg) {
      mwx.util.pageBack('startChangeBg');
    } else {
      mwx.util.pageBack('cardDetail');
    }
  },
  async handleCardBottomText() {
    let { cardBottomText } = this.data;
    if (!cardBottomText) {
      this.setData({
        cardTextBoxShow: true
      });
    } else {
      this.setData({
        cardBottomText: ''
      });
      // 清除已生成的证件照
      this.clearExistCard();
      if (this.data.activeViewTypeIndex == 1) {
        await this.createSixCardImage(this.data.cardImageSrc);
      }
    }
  },
  closeCardTextBox() {
    this.setData({
      cardTextBoxShow: false
    });
  },
  async confirmCardTextBox(e) {
    this.setData({
      cardTextBoxShow: false,
      cardBottomText: e.detail.trim()
    });
    mwx.report('createcard_addtext');
    // 清除已生成的证件照
    this.clearExistCard();
    if (this.data.activeViewTypeIndex == 1) {
      await this.createSixCardImage(this.data.cardImageSrc);
    }
  },
  stopBeautyAnimation() {
    this.setData({
      beautyAnimationShow: false
    });
  },
  startBeautyAnimation() {
    this.setData({
      beautyAnimationShow: true
    });
  },
  cancelColorSelect() {
    this.switchColor({ detail: this.previewColorIndex });
    this.setData({
      colorSelectShow: false
    });
  },
  confirmColorSelect() {
    this.setData({
      colorSelectShow: false
    });
  },
  cancelAdAlt() {
    this.setData({
      adAltShow: false
    });
    let buyCardInfo = this.createOrderInfo();
    wx.setStorageSync('buyCardInfo', buyCardInfo);
    buyCardInfo.color = this.getActiveColorInfo().color;
    buyCardInfo.singleCardImageSrc = this.data.cardImageSrc;
    this.setData({
      saveBoxShow: true,
      boxData: buyCardInfo
    });
  },
  confirmGoBackAdjustSize() {
    return mwx.service
      .confirmModal({
        content:
          '尺寸过大，无法生成排版照，不支持冲印，是否重新选择合适的尺寸规格？',
        confirmText: '重选规格',
        cancelText: '取消'
      })
      .then((r) => {
        if (r == 1) {
          mwx.navigateBack();
        }
      });
  },
  highDefinition() {
    this.faceEnhanceCallBack().catch((err) => {
      this.handleError(err);
    });
    this.setData({
      faceHighDefinitionShow: false
    });
  },
  hideHighDefinition() {
    this.setData({
      faceHighDefinitionShow: false
    });
  },
  checkAddToMyMiniProgram() {
    return new Promise((resolve, reject) => {
      wx.checkIsAddedToMyMiniProgram({
        success: (res) => {
          if (res.added) {
            resolve(1);
            this.isAddToMyMiniProgram = true;
          } else {
            mwx.Toast('请先添加到我的小程序');
          }
        }
      });
    });
  },
  closeAddToMyMiniProgram: mwx.util.ignoreMultiClick(function () {
    clearInterval(this.addToMyMiniProgramTimer);
    return this.checkAddToMyMiniProgram().then((r) => {
      this.setCardProductId({ cardProductId: -5 });
      this.goFinishCard();
      this.selectComponent('.addto-myminiprogram').close();
    });
  }),
  goFinishCard(str = '') {
    // 生成过换装的证件照，并且没有展示过换装弹窗
    let {
      changeClothPreviewImageSrc,
      colorList,
      activeColorIndex,
      cardWidth,
      cardHeight
    } = this.data;
    let showClothAlt =
      changeClothPreviewImageSrc && !this.isEverClothToolShow ? 1 : '';
    if (showClothAlt) {
      wx.setStorageSync('clothAltInfo', {
        backgroundColor: colorList[activeColorIndex].color,
        changeClothPreviewImageSrc,
        cardWidth,
        cardHeight
      });
    }
    mwx.navigateTo({
      url: `/packageA/finishCard/index?type=${this.query.from}&sixCardCount=${this.sixCardCount || ''
        }&useOriginImageSize=${this.useOriginImageSize ? 1 : ''}&activeClothId=${this.data.activeClothId || ''
        }&showClothAlt=${showClothAlt}&${str}`
    });
  },
  useCustomColor() {
    let info = searchEffectStatus.getStatus({
      type: 'origin',
      activeColorIndex: 1 // 手动设置获取非【不换底】
    });

    wx.setStorageSync(
      'customColor:imageSrc',
      this.data.activeColorIndex == -1
        ? info.originCardImageSrc
        : this.data.cardImageSrc
    );
    mwx.navigateTo({ url: '/packageA/customColor/index' });
    mwx.event.once('useCustomColor', (res) => {
      let colorList = [...this.data.colorList, res];
      // 从原图切换到其他底色
      if (this.data.activeColorIndex == -1) {
        this.clearCache();
        this.setData({
          cardImageSrc: info.originCardImageSrc,
          originCardImageSrc: info.originCardImageSrc
        });
      }

      this.setData({
        colorList,
        activeColorIndex: colorList.length - 1,
        colorSelectShow: false
      });
      mwx
        .pollCheck(() => {
          let arr = getCurrentPages();
          let page = arr[arr.length - 1];
          if (page.route == 'packageA/customColor/index') {
            return true;
          }
        })
        .then((r) => {
          setTimeout(() => {
            this.createSixCardImage(this.data.cardImageSrc);
          }, 700);
        });
    });
  },
  showCheckResult() {
    if (this.data.checkAltInfo.hidden == 1) {
      clearTimeout(this.checkAltTimer);
      this.setData({
        'checkAltInfo.hidden': 0
      });
    }
    this.setData({
      checkRuleResultShow: true
    });
  },
  closeCheckRuleResult() {
    this.setData({
      checkRuleResultShow: false
    });
    clearTimeout(this.checkAltTimer);
    this.checkAltTimer = setTimeout(() => {
      this.setData({
        'checkAltInfo.hidden': 1
      });
    }, 5000);
  },
  clearCache() {
    cache.clear();
    // 清除已生成的证件照
    this.clearExistCard();
    this.setData({
      beautyStatus: 0,
      lightStatus: 0
    });
  },
  closeEvaluate() {
    this.setData({
      evaluateSaveShow: false
    });
  },
  async finishEvaluate({ detail }) {
    let cb = () => {
      this.setCardProductId({ cardProductId: -8 });
      this.isGoFinishCard = true;
      this.goFinishCard();
    };

    mwx.api.wechatRating({ appletStar: detail.score });
    mwx.action.setUserInfo({ newUser: 0 });
    if (detail.score >= 3) {
      try {
        await mwx.setClipboardData({ data: detail.evaluateText });
        mwx.Toast(' ');
        wx.showToast({
          title: '去好评'
        });
        await mwx.util.delay(300);
      } catch (error) {
        console.error(error);
      }
      this.setData({
        evaluateSaveShow: false
      });
      try {
        let plugin = requirePlugin('wxacommentplugin');
        plugin.openComment({
          // wx_pay_id: '4200001729202306024807578', // 交易评价类账号选填
          success: (res) => {
            cb();
          },
          fail: (res) => {
            this.setData({
              unevaluateShow: true
            });
          }
        });
      } catch (error) {
        cb();
      }
    } else {
      this.setData({
        evaluateSaveShow: false
      });
      cb();
    }
  },
  hideUnEvaluate({ detail }) {
    this.setData({
      unevaluateShow: false
    });
    this.setCardProductId({ cardProductId: -8 });
    this.isGoFinishCard = true;
    this.goFinishCard();
  },
  changeHeight(e) {
    if (e.detail.auto) {
      this.setData({
        clothToolHeight: e.detail.height
      });
    } else {
      this.setData({
        clothToolHeight: e.detail
      });
      this.changeContainerHeight();
    }
  },
  changeContainerHeight() {
    let {
      clothToolShow,
      clothToolHeight,
      bgToolHeight,
      searchToolHeight,
      searchToolShow,
      clotheSelectHeight
    } = this.data;
    let height = clotheSelectHeight;
    let containerHeight =
      app.globalData.systemInfo.screenHeight -
      height -
      app.globalData.navbarHeight -
      56 / getApp().globalData.px2rpx; // 56:.bs__top的高度;
    containerHeight = containerHeight + 8;
    this.setData({
      containerHeight,
      containerScale: containerHeight / this.prevContainerHeight
    });
  },
  hideClothTool() {
    this.setData({
      clothToolShow: false
    });
    this.setData({
      activeClothId: this.prevClothId
    });
    if (this.prevClothId) {
      // 换之前的装
      this.switchCloth({
        detail: { clothId: this.prevClothId }
      });
    } else {
      // 不换装
      this.switchCloth({
        detail: { noCloth: true }
      });
    }
    this.hideCheckAltInfo();
  },
  useClothTool() {
    this.setData({
      clothToolShow: false
    });
  },
  async switchCloth(e) {
    await this.adjustPositionTask;
    let { clothId, beautyStatus, lightStatus } = e.detail;

    if (beautyStatus === undefined) {
      beautyStatus = this.data.beautyStatus;
    }
    if (lightStatus === undefined) {
      lightStatus = this.data.lightStatus;
    }

    // 获取美颜、补光之后（换装之前）的状态
    let latestEffectStatus = searchEffectStatus.getStatus({
      type: 'latestEffect'
    });

    // 获取原始抠图的状态
    let originStatus = searchEffectStatus.getStatus({
      type: 'origin'
    });

    // debugger;
    let params = {
      fileName: this.prevFileNameWithBg, // 采用未抠图之前的图
      clothId,
      beauty: this.data.clothBeautyOpen ? 1 : 0,
      faceLight: this.data.clothBeautyOpen ? 1 : 0,
      templateId: this.data.cardInfo.templateId || 0
    };

    // let cardImageCacheKey = `cardImageSrc:fileName=${params.fileName},clothId=${params.clothId}`;
    let cache_cardImageSrc;
    // 清除已生成的证件照
    this.clearExistCard();
    // debugger;

    this.setData({
      activeClothId: e.detail.clothId || ''
    });
    console.log(
      `换装【switchCloth】使用的fileName=${params.fileName},beauty=${params.beauty},faceLight=${params.faceLight}`
    );

    let key = `[cardCloth]:params=${JSON.stringify(params)}`;
    let data = apiCache.get(key);
    if (!e.detail.noCloth) {
      // 换装

      if (this.data.activeColorIndex == -1) {
        mwx.Toast('你选择的【不换底】不支持换装');
        return;
      }

      // console.log('进行换装，并缓存数据');
      let cardImageSrc;
      try {
        mwx.showLoading('请等待3~15秒', true);
        data = await mwx.api.cardCloth(params);
        cardImageSrc = (await mwx.downloadFile(data.url)).tempFilePath;
      } catch (error) {
        mwx.Toast('换装失败，请重试');
        mwx.hideLoading();
        mwx.log.error(error);
        this.setData({
          activeClothId: ''
        });
        return;
      }
      mwx.hideLoading();

      this.currentAlphaFileName = data.fileName; // 换装操作之后更新当前的fileName
      this.originFileNameList.push(data.fileName);
      wx.setStorageSync('originFileNameList', this.originFileNameList);

      // 更新未特效处理的换装原图
      this.setData({
        originCardImageSrc: cardImageSrc,
        cardImageSrc
      });
      if (beautyStatus !== undefined) {
        this.setData({
          beautyStatus
        });
      }
      if (lightStatus !== undefined) {
        this.setData({
          lightStatus
        });
      }
    } else {
      // 取消换装的逻辑

      // 还没进行过美颜、补光，就用初始状态
      if (!latestEffectStatus) {
        latestEffectStatus = originStatus;
      }
      this.currentAlphaFileName = latestEffectStatus.fileName;
      this.setData({
        originCardImageSrc: originStatus.originCardImageSrc,
        cardImageSrc: latestEffectStatus.cardImageSrc,
        beautyStatus: 0,
        lightStatus: 0
      });
    }

    if (this.data.activeViewTypeIndex == 1) {
      await this.waitCreateSixCard();
    }
  },
  async showClothTool() {
    this.setData({
      clothToolShow: true,
      activeViewTypeIndex: 0
    });
    this.prevClothId = this.data.activeClothId;
    // 第一次打开时，展示推荐的换装
    if (!this.isEverClothToolShow && this.changeClothRecommand) {
      this.setData({
        recommandClothType: this.changeClothRecommand.clothType
      });
    }
    this.isEverClothToolShow = true; // 记录是否用户是否手动展示过换装
  },
  createSearchEffectStatus() {
    let cache = {};
    // 存储 origin、beauty、light的fileName和url
    let self = this;
    return {
      setStatus({ type, activeColorIndex, data }) {
        if (activeColorIndex === undefined) {
          activeColorIndex = self.data.activeColorIndex;
        }
        let cacheKey = `isUseOriginImage=${activeColorIndex == -1
          },type=${type}`;
        let fakeCache = { ...cache };
        console.log('\n\n========\n更新前', fakeCache);
        cache[cacheKey] = {
          ...(cache[cacheKey] || {}),
          ...data
        };
        console.log(`更新type=${type}, 【key=${cacheKey}】`, data);
        console.log('\n更新后', cache);
        console.log('========\n\n');
        // TODO
        self.setData({
          ___________cache: cache
        });
      },
      getStatus({ type, activeColorIndex }) {
        if (activeColorIndex === undefined) {
          activeColorIndex = self.data.activeColorIndex;
        }
        let cacheKey = `isUseOriginImage=${activeColorIndex == -1
          },type=${type}`;
        return cache[cacheKey];
      },
      clear() {
        cache = {};
        console.log('==========clear==========');
        self.setData({
          ___________cache: cache
        });
      }
    };
  },
  hideClothSaveBox() {
    this.setData({
      clothSaveBoxShow: false
    });
  },
  // 换装完成支付
  async clothFinishPayment(e) {
    mwx.showLoading('正在处理中，请勿离开', true);
    let res;
    let orderNo = e.detail.orderNo;
    this.setData({
      clothSaveBoxShow: false
    });
    try {
      res = await mwx.api.cardPayDetail({
        orderNo
      });
      let cardImageSrc = (await mwx.downloadFile(res.alphaUrl)).tempFilePath;
      this.setData({
        cardImageSrc
      });
      this.clearExistCard();
      await this.createCard({ cardProductId: e.detail.cardProductId });
      console.log('res', res);
      this.setData({
        clothSaveBoxShow: false
      });
      this.isGoFinishCard = true;
      this.goFinishCard(`&isAppreciation=1&fileName=${res.fileName}`);
    } catch (error) {
      mwx.log.error(error);
      this.setData({
        failReasonText: `证件照生成出错，请联系人工客服处理。\n订单编号：${orderNo}`,
        bottomDialogShow: true
      });
      wx.setClipboardData({
        data: orderNo,
        success: function (res) { },
        fail: () => {
          mwx.Toast('订单号复制失败');
        }
      });
      mwx.hideLoading();
      return;
    }
  },
  setRecord({ key, val, text }) {
    if (!recordCache[key]) {
      recordCache[key] = [];
    }
    recordCache[key].push({
      val,
      text
    });
    console.log(key, recordCache[key]);
    this.setData({
      [key]: val
    });
  },
  closeBottomDialog() {
    this.setData({
      bottomDialogShow: false
    });
  },
  confirmClothAlt() {
    this.setData({
      clothAltShow: false
    });
    this.showClothTool();
    this.confirmClothCallback();
  },
  cancelClothAlt() {
    this.setData({
      clothAltShow: false
    });
    this.hideCheckAltInfo();
  },
  // 隐藏侧边检查项
  hideCheckAltInfo() {
    clearTimeout(this.checkAltTimer);
    if (this.data.checkAltInfo.text) {
      this.checkAltTimer = setTimeout(() => {
        this.setData({
          'checkAltInfo.hidden': 1
        });
      }, 5000);
    }
  },
  // 检测是否需要展示自动换装弹窗
  checkIfNeedShowClothAlt() {
    let isClothAltShow = wx.getStorageSync('isClothAltShow');
    let showChangeClothPercent =
      getApp().globalData.setting.showChangeClothPercent; // 抽样比例
    if (
      isClothAltShow ||
      (showChangeClothPercent !== undefined &&
        Math.random() > showChangeClothPercent)
    ) {
      return;
    }
    if (this.query.from == 'changeClothes') {
      return;
    }
    this.showAutoChangeClothBox();
  },
  // 展示自动换装弹窗
  async showAutoChangeClothBox() {
    let startTime = new Date();
    await mwx.pollCheck(() => this.changeClothRecommand);
    let { clothId } = this.changeClothRecommand;
    console.log('cardFaceAttribute接口耗时', new Date() - startTime);
    startTime = new Date();

    // let clothId = 'api_20240204-09'; // 后台返回的匹配衣服
    let data = await mwx.api.cardCloth({
      fileName: this.prevFileNameWithBg, // 采用未抠图之前的图
      clothId,
      beauty: this.data.clothBeautyOpen ? 1 : 0,
      faceLight: this.data.clothBeautyOpen ? 1 : 0,
      templateId: this.data.cardInfo.templateId || 0
    });
    console.log('cardCloth接口耗时', new Date() - startTime);
    let cardImageSrc = (await mwx.downloadFile(data.url)).tempFilePath;
    this.setData({
      changeClothPreviewImageSrc: cardImageSrc
    });

    this.confirmClothCallback = () => {
      this.currentAlphaFileName = data.fileName; // 换装操作之后更新当前的fileName
      this.originFileNameList.push(data.fileName);
      wx.setStorageSync('originFileNameList', this.originFileNameList);

      this.setData({
        originCardImageSrc: cardImageSrc,
        cardImageSrc,
        activeClothId: clothId
      });
      wx.setStorageSync('isClothAltShow', 1);
    };

    mwx.event.off('createCard:showClothTool');
    mwx.event.on('createCard:showClothTool', () => {
      this.setData({
        saveBoxShow: false
      });
      this.confirmClothAlt();
    });

    let pro = await mwx.pollCheck(
      () => {
        // 定时检测，当已经有其他弹窗展示时，不展示自动换装弹窗
        let {
          cardTextBoxShow,
          colorSelectShow,
          checkRuleResultShow,
          clothToolShow,
          clothSaveBoxShow,
          saveBoxShow
        } = this.data;
        if (
          cardTextBoxShow ||
          colorSelectShow ||
          checkRuleResultShow ||
          clothToolShow ||
          clothSaveBoxShow ||
          saveBoxShow ||
          this.isEverClothToolShow
        ) {
          return false;
        } else {
          return true;
        }
      },
      1000,
      50 * 1000,
      true
    );
    try {
      this.clothShowTimer = pro.timer;
    } catch (error) { }

    this.setData({
      clothAltShow: true
    });
    // this.isEverClothToolShow = true;
  },
  // 换装切换美颜补光，需要重新进行换装
  async switchClothBeauty(e) {
    this.setData({
      clothBeautyOpen: e.detail
    });
    if (!this.data.activeClothId) {
      return;
    }
    try {
      mwx.showLoading('请等待3~15秒', true);
      let data = await mwx.api.cardCloth({
        fileName: this.prevFileNameWithBg, // 采用未抠图之前的图
        clothId: this.data.activeClothId,
        beauty: this.data.clothBeautyOpen ? 1 : 0,
        faceLight: this.data.clothBeautyOpen ? 1 : 0,
        templateId: this.data.cardInfo.templateId || 0
      });
      let cardImageSrc = (await mwx.downloadFile(data.url)).tempFilePath;

      this.currentAlphaFileName = data.fileName; // 换装操作之后更新当前的fileName
      this.originFileNameList.push(data.fileName);
      wx.setStorageSync('originFileNameList', this.originFileNameList);

      this.setData({
        originCardImageSrc: cardImageSrc,
        cardImageSrc
        // beautyStatus: beauty ? 2 : 0,
        // lightStatus: beauty ? 2 : 0
      });
    } catch (error) {
      mwx.log.error(error);
    }
    mwx.hideLoading();
  }
});
