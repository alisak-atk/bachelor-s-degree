import { useState, useEffect } from "react";
import { PageTitle } from "@/hooks/PageTitle";
import { Modal, Button, Input, message } from "antd";
import { EyeOutlined, CopyOutlined, PlusOutlined } from "@ant-design/icons";
import LotDateSelector from "@/components/date/LotDateSelector";
import { useAuth } from "@/utils/AuthProvider";
import RankDateSelector from "@/components/date/RankDateSelector";
import { apiUrl, baseUrl } from "@/utils/config";

const LinkU = () => {
  PageTitle("Link");
  const { user } = useAuth();
  const [isUrlVisible, setIsUrlVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [links, setLinks] = useState({ pop_up: "", lot: "", rank: "" });
  const [customLotUrl, setCustomLotUrl] = useState("");
  const [customTopUrl, setCustomTopUrl] = useState("");


  const usernameUrl = user?.username ? `${baseUrl}/${user.username}` : "ກະລຸນາກຳນົດຊື່ກ່ອນ";

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    message.success("ຄັດລ໋ອກສຳເລັດ!");
  };

  const toggleUrlVisibility = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsUrlVisible(true);
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${apiUrl}/profile/get-link`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setLinks({
          pop_up: `${baseUrl}/${data.links.pop_up}`,
          lot: `${baseUrl}/${data.links.lot}`,
          rank: `${baseUrl}/${data.links.rank}`,
        });
      } else {
        message.error("ດຶງຂໍ້ມູນລິ້ງບໍ່ສໍາເລັດ");
      }
    } catch (err) {
      message.error("ມີບັນຫາກະລຸນາສ້າງລິ້ງໃໝ່");
    }
  };

  const createLinks = async () => {
    try {
      const res = await fetch(`${apiUrl}/profile/new-link`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setLinks({
          pop_up: data.links.pop_up ? `${baseUrl}/${data.links.pop_up}` : "",
          lot: data.links.lot ? `${baseUrl}/${data.links.lot}` : "",
          rank: data.links.rank ? `${baseUrl}/${data.links.rank}` : "",
        });
        message.success("ສ້າງລິ້ງໃໝ່ສໍາເລັດ!");
      } else {
        message.error("ສ້າງລິ້ງບໍ່ສໍາເລັດກະລຸນາລອງໃໝ່");
      }
    } catch (err) {
      message.error("ມີບັນຫາໃນ server ເມື່ອສ້າງລິ້ງໃໝ່");
    }
  };


  useEffect(() => {
    if (user?.id) {
      fetchLinks();
    }
  }, [user?.id]);




  return (
    <div className="bg-white text-black p-4 shadow-md rounded-lg transition-colors dark:bg-gray-900 dark:text-white">
      <h1 className="text-xl font-lao font-semibold mb-4 dark:text-white">ໜ້າສ້າງລິ້ງ</h1>

      <div className="flex gap-2 mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={createLinks}>
          <span className="font-lao">ສ້າງລິ້ງ</span>
        </Button>

      </div>

      <div className="mb-4">
        <label className="block font-lao text-sm font-medium pb-2 dark:text-white">ໂດເນດ</label>
        <div className="relative flex items-center">
          <Input
            value={usernameUrl}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-lao text-sm font-medium pb-2 dark:text-white">ແຈ້ງເຕືອນ</label>
        <div className="relative flex items-center">
          <Input
            value={isUrlVisible ? links.pop_up : "*****"}
            suffix={
              <div
                onClick={toggleUrlVisibility}
                className="cursor-pointer text-gray-900"
              >
                {isUrlVisible ? "" : <EyeOutlined />}
              </div>
            }
          />
          <button onClick={() => handleCopy(links.pop_up)} className="px-3 text-gray-500">
            <CopyOutlined />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-lao text-sm font-medium pb-2 dark:text-white">ລອດໂດເນດ</label>

        <LotDateSelector
          baseLotPath={links.lot.replace(baseUrl + "/", "") ? `${baseUrl}/${links.lot.replace(baseUrl + "/", "")}` : ""}
          onGenerate={(url) => {
            setCustomLotUrl(url);
            message.success("ສ້າງລິ້ງສຳເລັດ!");
          }}
        />


        <div className="relative flex items-center">
          <Input
            value={isUrlVisible ? customLotUrl : "*****"}
            readOnly
            suffix={
              <div
                onClick={toggleUrlVisibility}
                className="cursor-pointer text-gray-900"
              >
                {isUrlVisible ? "" : <EyeOutlined />}
              </div>
            }
          />

          <button onClick={() => handleCopy(customLotUrl)} className="px-3 text-gray-500" disabled={!customLotUrl}>
            <CopyOutlined />
          </button>
        </div>
      </div>


      <div className="mb-4">
        <label className="block font-lao text-sm font-medium pb-2 dark:text-white">ທອບໂດເນດ</label>

        <RankDateSelector
          baseTopPath={links.rank.replace(baseUrl + "/", "") ? `${baseUrl}/${links.rank.replace(baseUrl + "/", "")}` : ""}
          onGenerate={(url) => {
            setCustomTopUrl(url);
            message.success("ສ້າງລິ້ງທອບໂດເນດສຳເລັດ!");
          }}
        />

        <div className="relative flex items-center">
          <Input
            value={isUrlVisible ? customTopUrl : "*****"}
            readOnly
            suffix={
              <div
                onClick={toggleUrlVisibility}
                className="cursor-pointer text-gray-900"
              >
                {isUrlVisible ? "" : <EyeOutlined />}
              </div>
            }
          />

          <button onClick={() => handleCopy(customTopUrl)} className="px-3 text-gray-500" disabled={!customTopUrl}>
            <CopyOutlined />
          </button>
        </div>
      </div>

      <Modal
        title="ຢືນຢັນເພື່ອເບິ່ງ URL"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>

            <h1 className="font-lao">ຍົກເລີກ</h1>
          </Button>,
          <Button key="ok" type="primary" onClick={handleModalOk}>
            <h1 className="font-lao">ຕົກລົງ</h1>
          </Button>
        ]}
      >
        <p className="font-lao text-xl dark:text-white">- ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເບິ່ງ URL?</p>
        <p className="font-lao text-xl dark:text-white">- ກະລຸນາກວດສອບໃຫ້ແນ່ໃຈວ່າຂໍ້ມູນນີ້ເປັນສ່ວນຕົວ.</p>
        <p className="font-lao text-xl dark:text-white">- ຢ່າສະແດງອັນນີ້ຢູ່ໃນ stream ຂອງທ່ານ.</p>
        <p className="font-lao text-xl dark:text-white">- ຢ່າ share ກັບໃຜ.</p>
      </Modal>
    </div>
  );
};

export default LinkU;
